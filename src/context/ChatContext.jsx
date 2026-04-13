import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react'
import { chatService } from '../services/index'

const ChatContext = createContext()
// FREE_LIMIT removed

// ─── Chat history cache (localStorage, stale-while-revalidate) ───────────────
const CHAT_CACHE_KEY = 'ev_chat_cache'
const CHAT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes — only used for background refresh decision

// Always returns cached data regardless of age (stale is fine to show instantly)
function getChatCache() {
  try {
    const raw = localStorage.getItem(CHAT_CACHE_KEY)
    if (!raw) return null
    const { data } = JSON.parse(raw)
    return data || null
  } catch { return null }
}

// Returns true only when background refresh is needed
function isChatCacheStale() {
  try {
    const raw = localStorage.getItem(CHAT_CACHE_KEY)
    if (!raw) return true
    const { ts } = JSON.parse(raw)
    return Date.now() - ts > CHAT_CACHE_TTL
  } catch { return true }
}

function setChatCache(data) {
  try { localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function clearChatCache() {
  localStorage.removeItem(CHAT_CACHE_KEY)
}
// ──────────────────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [recentChats, setRecentChats] = useState(() => {
    const c = getChatCache()
    return c?.chats || (Array.isArray(c) ? c : [])
  })
  const [chatsPage, setChatsPage] = useState(1)
  const [chatsHasMore, setChatsHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chatCount, setChatCount] = useState(0)
  const [tokenCount, setTokenCount] = useState(0)
  const [tokenLimit, setTokenLimit] = useState(10000)
  const [userPlan, setUserPlan] = useState('free')
  const [hasUnlimitedChats, setHasUnlimitedChats] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Character-drip queue — chunks from the stream are split into individual
  // characters and drained one at a time so the UI renders char-by-char.
  const dripQueueRef = useRef([])       // pending characters
  const dripIntervalRef = useRef(null)  // setInterval handle
  const abortControllerRef = useRef(null)
  const lastUpdateRef = useRef(null)    // track last update time for throttling
  const [isStreaming, setIsStreaming] = useState(false)

  const startDrip = useCallback(() => {
    if (dripIntervalRef.current) return  // already running
    
    // Use requestAnimationFrame for smoother updates that sync with browser repaints
    const processDrip = () => {
      if (dripQueueRef.current.length === 0) {
        dripIntervalRef.current = null
        return
      }
      
      // Calculate optimal chunk size based on queue length
      // For smooth streaming, we want smaller chunks more frequently
      const queueLength = dripQueueRef.current.length
      let chunkSize
      if (queueLength > 1000) {
        // Large backlog: process bigger chunks to catch up
        chunkSize = Math.min(100, queueLength)
      } else if (queueLength > 100) {
        // Medium backlog: moderate chunks
        chunkSize = Math.min(50, queueLength)
      } else {
        // Small queue: small chunks for smooth appearance
        chunkSize = Math.min(10, queueLength)
      }
      
      const chars = dripQueueRef.current.splice(0, chunkSize).join('')
      
      // Use a ref to track the last update time to throttle updates
      const now = Date.now()
      if (!lastUpdateRef.current || now - lastUpdateRef.current >= 16) { // ~60fps
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chars }
          }
          return updated
        })
        lastUpdateRef.current = now
      } else {
        // If we're updating too fast, batch the characters for next frame
        dripQueueRef.current.unshift(...chars.split(''))
      }
      
      if (dripQueueRef.current.length > 0) {
        dripIntervalRef.current = requestAnimationFrame(processDrip)
      } else {
        dripIntervalRef.current = null
      }
    }
    
    dripIntervalRef.current = requestAnimationFrame(processDrip)
  }, [])

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort()
    if (dripIntervalRef.current) {
      cancelAnimationFrame(dripIntervalRef.current)
      dripIntervalRef.current = null
    }
    dripQueueRef.current = []
    setMessages((prev) => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      if (last?.role === 'assistant' && last.streaming) {
        updated[updated.length - 1] = { ...last, streaming: false }
      }
      return updated
    })
    setLoading(false)
    setIsStreaming(false)
  }, [])

  const sendMessage = useCallback(async (message, documentId = null, docInfo = null, image = null) => {

    try {
      setError(null);
      setLoading(true);

      // Add user message immediately (optimistic update)
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: message || 'Analyze this image',
          timestamp: new Date(),
          document: docInfo || null,
          image: image || null,
        },
      ]);

      // Push an empty streaming placeholder for the assistant reply
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', streaming: true, timestamp: new Date() },
      ]);

      // Reset drip queue for this new response
      dripQueueRef.current = []

      // Create a new AbortController for this request
      const controller = new AbortController()
      abortControllerRef.current = controller
      setIsStreaming(true)

      // Stream tokens — push each chunk's characters into the drip queue
      const result = await chatService.sendMessageStream(
        message,
        documentId,
        image,
        activeChatId,
        (chunk) => {
          dripQueueRef.current.push(...chunk.split(''))
          startDrip()
          // Hide the TypingIndicator once the first chunk arrives
          setLoading(false)
        },
        controller.signal
      );

      // Wait for the drip queue to fully drain before marking streaming done
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (dripQueueRef.current.length === 0 && !dripIntervalRef.current) {
            clearInterval(check)
            resolve()
          }
        }, 32)
      })

      setIsStreaming(false)

      // Mark streaming done on the placeholder
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, streaming: false }
        }
        return updated
      })

      // Invalidate chat cache so sidebar reflects the new message on next load
      clearChatCache()

      // Refresh token count from server after each message (skip if aborted)
      if (!result?.aborted) fetchChatCount();

      // Track the active chat session so subsequent messages append to same Chat doc
      if (result.chatId) {
        setActiveChatId(String(result.chatId));
      }

      return result;
    } catch (err) {
      const errorMsg = err.message || 'Failed to send message';
      setError(errorMsg);
      // Stop the drip and clear the queue so stale characters don't appear
      if (dripIntervalRef.current) {
        cancelAnimationFrame(dripIntervalRef.current)
        dripIntervalRef.current = null
      }
      dripQueueRef.current = []
      setIsStreaming(false)
      // Replace the empty assistant placeholder with the error message
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        
        if (last?.role === 'assistant' && last?.streaming) {
          updated[updated.length - 1] = {
            role: 'assistant',
            streaming: false,
            timestamp: new Date(),
            content: `⚠️ **Request Failed**\n\n${errorMsg}`
          }
        }
        return updated
      });

      // Optionally dispatch an upgrade event if it's explicitly required
      if (err.upgradeRequired) {
        window.dispatchEvent(new CustomEvent('upgrade:required', { 
          detail: { requiredPlan: err.requiredPlan || 'pro', currentPlan: userPlan } 
        }))
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeChatId]); // fetchChatCount is declared later in the file; the closure captures it by ref

  const fetchChatCount = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await chatService.getChatCount()
      // Handle both old format (just count) and new format (with plan and unlimited)
      if (typeof data === 'number') {
        setChatCount(data)
        setTokenCount(0)
        setUserPlan('free')
        setHasUnlimitedChats(false)
      } else if (typeof data === 'object' && data !== null) {
        setChatCount(data.count || 0)
        setTokenCount(data.tokenCount || 0)
        setTokenLimit(data.tokenLimit || 200)
        setUserPlan(data.plan || 'free')
        setHasUnlimitedChats(data.unlimited || false)
      }
    } catch {
      // silently ignore — user may not be authed yet
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchRecentChats = useCallback(async (forceRefresh = false, page = 1) => {
    try {
      // 1. Show cached page-1 data instantly (stale-while-revalidate)
      if (page === 1) {
        const cached = getChatCache()
        const cachedChats = cached?.chats || (Array.isArray(cached) ? cached : null)
        if (cachedChats) setRecentChats(cachedChats)
      }

      // 2. Refresh from API if stale, forced, or no cache
      if (forceRefresh || !getChatCache() || isChatCacheStale() || page > 1) {
        const data = await chatService.getChats(page, 20)
        if (page === 1) {
          const chats = data?.chats || []
          setChatCache({ chats, ts: Date.now() })
          setRecentChats(chats)
        } else {
          // Append next page
          setRecentChats(prev => [...prev, ...(data?.chats || [])])
        }
        setChatsPage(page)
        setChatsHasMore(data?.pagination?.hasMore || false)
        return data
      }
      return getChatCache()
    } catch { /* silently ignore */ }
  }, [])

  const loadMoreChats = useCallback(() => {
    fetchRecentChats(false, chatsPage + 1)
  }, [chatsPage, fetchRecentChats])

  const recentChatsRef = useRef([])
  useEffect(() => { recentChatsRef.current = recentChats }, [recentChats])

  const loadHistory = useCallback(async (chatId) => {
    if (!chatId) return
    const id = String(chatId)

    // 1. Try recentChats first — getChats() already returns messages,
    //    so most clicks cost zero API calls
    const cached = recentChatsRef.current.find(
      c => String(c._id) === id
    )
    if (cached?.messages?.length > 0) {
      const msgs = cached.messages.map(m => ({
        role: m.role,
        content: m.content,
        image: m.image || null,
        timestamp: new Date(m.timestamp),
      }))
      setMessages(msgs)
      setActiveChatId(id)
      return
    }

    // 2. Fall back to individual fetch (for paginated/older chats)
    setHistoryLoading(true)
    try {
      const data = await chatService.getChatById(chatId)
      // Support multiple backend response shapes
      const rawMsgs = data?.messages || data?.chat?.messages || []
      const msgs = rawMsgs.map(m => ({
        role: m.role,
        content: m.content,
        image: m.image || null,
        timestamp: new Date(m.timestamp),
      }))
      setMessages(msgs)
      setActiveChatId(id)
    } catch {
      setError('Failed to load chat. Please try again.')
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const deleteChat = useCallback(async (chatId) => {
    await chatService.deleteChat(chatId)
    clearChatCache()
    setRecentChats((prev) => prev.filter((c) => c._id !== chatId))
    setActiveChatId((prev) => (prev === chatId ? null : prev))
  }, [])

  const deleteAllChats = useCallback(async () => {
    await chatService.deleteAllChats()
    clearChatCache()
    setMessages([])
    setRecentChats([])
    setError(null)
    setActiveChatId(null)
  }, [])

  const resetChat = useCallback(() => {
    setMessages([])
    setError(null)
    setActiveChatId(null)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        isStreaming,
        historyLoading,
        error,
        chatCount,
        tokenCount,
        tokenLimit,
        statsLoading,
        userPlan,
        hasUnlimitedChats,
        activeChatId,
        recentChats,
        chatsHasMore,
        sendMessage,
        stopGenerating,
        fetchChatCount,
        fetchRecentChats,
        loadMoreChats,
        loadHistory,
        resetChat,
        deleteChat,
        deleteAllChats,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
