import { createContext, useState, useContext, useCallback, useRef } from 'react'
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
  const [recentChats, setRecentChats] = useState(() => getChatCache() || [])
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
  const [isStreaming, setIsStreaming] = useState(false)

  const startDrip = useCallback(() => {
    if (dripIntervalRef.current) return  // already running
    dripIntervalRef.current = setInterval(() => {
      if (dripQueueRef.current.length === 0) {
        clearInterval(dripIntervalRef.current)
        dripIntervalRef.current = null
        return
      }
      // Drain up to 2 chars per tick — feels natural without being too slow
      const chars = dripQueueRef.current.splice(0, 200).join('')
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: last.content + chars }
        }
        return updated
      })
    }, 6) // ~12ms per tick, 5 chars/tick ≈ 300 chars/sec (ChatGPT-speed feel)
  }, [])

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort()
    clearInterval(dripIntervalRef.current)
    dripIntervalRef.current = null
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
    console.log('[ChatContext.sendMessage] Called with:', { message, documentId, docInfo, image });
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
      clearInterval(dripIntervalRef.current)
      dripIntervalRef.current = null
      dripQueueRef.current = []
      setIsStreaming(false)
      // Remove both the user message and the empty assistant placeholder
      setMessages((prev) => {
        const trimmed = [...prev]
        // Remove trailing assistant placeholder if it's empty / streaming
        if (trimmed[trimmed.length - 1]?.streaming) trimmed.pop()
        // Remove the user message
        if (trimmed[trimmed.length - 1]?.role === 'user') trimmed.pop()
        return trimmed
      });
      console.error('[ChatContext.sendMessage] Error:', err.message);
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

  const fetchRecentChats = useCallback(async (forceRefresh = false) => {
    try {
      // 1. Show cached data instantly (stale-while-revalidate)
      const cached = getChatCache()
      if (cached?.chats) setRecentChats(cached.chats)

      // 2. Refresh in background if stale, forced, or no cache
      if (forceRefresh || !cached || isChatCacheStale()) {
        const data = await chatService.getChats()
        setChatCache(data)
        if (data?.chats) setRecentChats(data.chats)
        return data
      }
      return cached
    } catch { /* silently ignore */ }
  }, [])

  const loadHistory = useCallback(async (forceRefresh = false) => {
    setHistoryLoading(true)
    try {
      let data = getChatCache()
      if (!data || forceRefresh || isChatCacheStale()) {
        data = await chatService.getChats()
        setChatCache(data)
      }
      if (data?.chats) setRecentChats(data.chats)
      const allMessages = (data?.chats || [])
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .flatMap(chat =>
          chat.messages.map(m => ({
            role: m.role,
            content: m.content,
            image: m.image || null,
            timestamp: new Date(m.timestamp),
          }))
        )
      setMessages(allMessages)
      return data
    } catch (err) {
      console.error('[loadHistory] failed:', err.response?.data || err.message)
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
        sendMessage,
        stopGenerating,
        fetchChatCount,
        fetchRecentChats,
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
