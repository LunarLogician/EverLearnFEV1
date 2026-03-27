import { createContext, useState, useContext, useCallback } from 'react'
import { chatService } from '../services/index'

const ChatContext = createContext()
// FREE_LIMIT removed

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chatCount, setChatCount] = useState(0)
  const [tokenCount, setTokenCount] = useState(0)
  const [tokenLimit, setTokenLimit] = useState(200)
  const [userPlan, setUserPlan] = useState('free')
  const [hasUnlimitedChats, setHasUnlimitedChats] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

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

      // Get response from API
      const response = await chatService.sendMessage(message, documentId, image, activeChatId);
      console.log('[ChatContext.sendMessage] API response:', response);

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message?.content, timestamp: new Date() },
      ]);

      // Refresh token count from server after each message
      fetchChatCount();

      // Track the active chat session so subsequent messages append to same Chat doc
      if (response.chatId) {
        setActiveChatId(response.chatId);
      }

      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send message';
      setError(errorMsg);
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1));
      console.error('[ChatContext.sendMessage] Error:', err?.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activeChatId]);

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

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const data = await chatService.getChats()
      const allMessages = (data.chats || [])
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
    // If the deleted chat is the active one, reset the view
    setActiveChatId((prev) => (prev === chatId ? null : prev))
  }, [])

  const deleteAllChats = useCallback(async () => {
    await chatService.deleteAllChats()
    setMessages([])
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
        historyLoading,
        error,
        chatCount,
        tokenCount,
        tokenLimit,
        statsLoading,
        userPlan,
        hasUnlimitedChats,
        activeChatId,
        sendMessage,
        fetchChatCount,
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
