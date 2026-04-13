import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Copy, Check, ExternalLink, Volume2, Square, Star, Layers, Lightbulb, Zap } from 'lucide-react'
import { useState, useCallback, lazy, Suspense, useEffect, memo } from 'react'

const LazyCodeBlock = lazy(() =>
  Promise.all([
    import('react-syntax-highlighter').then(m => m.Prism),
    import('react-syntax-highlighter/dist/esm/styles/prism').then(m => m.oneLight)
  ]).then(([Prism, oneLight]) => ({
    default: ({ language, children }) => (
      <Prism style={oneLight} language={language} PreTag="div">{children}</Prism>
    )
  }))
)
import '../styles/streaming.css'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [text])
  return (
    <button onClick={copy} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors">
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// Memoized ReactMarkdown component to prevent unnecessary re-renders
const MemoizedReactMarkdown = memo(({ content, streaming }) => {
  return (
    <ReactMarkdown
      remarkPlugins={streaming ? [] : [remarkGfm, remarkMath]} // Skip heavy plugins during streaming
      rehypePlugins={streaming ? [] : [rehypeKatex]} // Skip math during streaming
      components={{
        h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5 text-slate-900 dark:text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mt-2.5 mb-1 text-slate-900 dark:text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-slate-800 dark:text-slate-200">{children}</h3>,
        p: ({ children }) => <p className="mb-2.5 last:mb-0 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2.5 space-y-1 text-slate-700 dark:text-slate-300">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2.5 space-y-1 text-slate-700 dark:text-slate-300">{children}</ol>,
        li: ({ node, children, ...props }) => {
          // task list item — remark-gfm adds a checkbox input as first child
          if (node?.children?.[0]?.type === 'element' && node.children[0].tagName === 'input') {
            return <li className="flex items-start gap-2 text-sm list-none -ml-4">{children}</li>
          }
          return <li className="text-sm">{children}</li>
        },
        input: ({ checked }) => (
          <input
            type="checkbox"
            checked={!!checked}
            readOnly
            className="mt-0.5 h-3.5 w-3.5 rounded accent-emerald-700 flex-shrink-0"
          />
        ),
        strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-600 dark:text-slate-400">{children}</em>,
        del: ({ children }) => <del className="line-through text-slate-400">{children}</del>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-900 underline underline-offset-2 inline-flex items-center gap-0.5"
          >
            {children}
            <ExternalLink size={10} className="flex-shrink-0 opacity-60" />
          </a>
        ),
        hr: () => <hr className="my-3 border-slate-200" />,
        img: ({ src, alt }) => (
          <img src={src} alt={alt} className="rounded-xl max-w-full my-2 border border-slate-100" />
        ),
        code: ({ inline, className, children }) => {
          if (inline) {
            return <code className="bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5 text-xs font-mono text-emerald-800">{children}</code>
          }
          const lang = /language-(\w+)/.exec(className || '')?.[1] || ''
          const codeStr = String(children).replace(/\n$/, '')
          
          // During streaming, show simple code blocks without syntax highlighting
          if (streaming) {
            return (
              <div className="my-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
                  <span className="text-[11px] text-slate-400 font-mono">{lang || 'code'}</span>
                </div>
                <pre className="m-0 p-4 bg-slate-50 text-[0.78rem] overflow-x-auto dark:bg-slate-900 dark:text-slate-300">
                  {codeStr}
                </pre>
              </div>
            )
          }
          
          return (
            <div className="my-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
                <span className="text-[11px] text-slate-400 font-mono">{lang || 'code'}</span>
                <CopyButton text={codeStr} />
              </div>
              <Suspense fallback={<pre className="m-0 p-4 bg-slate-50 text-[0.78rem] overflow-x-auto">{codeStr}</pre>}>
                <LazyCodeBlock language={lang || 'text'}>{codeStr}</LazyCodeBlock>
              </Suspense>
            </div>
          )
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-[3px] border-emerald-500 pl-3 italic text-slate-500 my-2 bg-emerald-50/60 py-1.5 rounded-r-lg pr-3">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-slate-100 last:border-0">{children}</tr>,
        th: ({ children }) => <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{children}</th>,
        td: ({ children }) => <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
})

MemoizedReactMarkdown.displayName = 'MemoizedReactMarkdown'

export default function MessageBubble({ message, userInitials = 'ME', isLatest = false, onQuickReply }) {
  const isUser = message.role === 'user'

  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  const [copiedResponse, setCopiedResponse] = useState(false)
  const copyResponse = useCallback(() => {
    if (!message.content) return
    navigator.clipboard.writeText(message.content).then(() => {
      setCopiedResponse(true)
      setTimeout(() => setCopiedResponse(false), 2000)
    })
  }, [message.content])

  const [isSaved, setIsSaved] = useState(false)
  const toggleSave = useCallback(() => setIsSaved(v => !v), [])

  const [isPlaying, setIsPlaying] = useState(false)
  const toggleTTS = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      if (!message.content) return
      const utterance = new SpeechSynthesisUtterance(message.content)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      utterance.rate = 0.95 // slightly slower for better academic pacing
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }, [message.content, isPlaying])

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-2 shadow-sm border border-emerald-900/20">
          <span className="text-white text-[9px] font-black">SA</span>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[80%]`}>
        {isUser ? (
          <div className="message-user">
            {message.document && (
              <div className="mb-2 flex items-center gap-2 bg-white/15 rounded-lg px-2.5 py-1.5 border border-white/20">
                <div className="bg-white/20 text-white/90 text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                  {message.document.type}
                </div>
                <span className="text-white/90 text-xs truncate max-w-[180px]">{message.document.name}</span>
              </div>
            )}
            {message.image && (
              <div className="mb-2">
                <img src={message.image} alt="uploaded" className="max-h-48 max-w-full rounded-lg object-contain" />
              </div>
            )}
            {message.content && (
              <p className="text-[0.9rem] leading-relaxed break-words">{message.content}</p>
            )}
          </div>
        ) : (
          <div className="message-assistant w-full border border-slate-200 dark:border-gray-700 bg-[#f9fafb] dark:bg-[#1a1b23] p-5 rounded-2xl shadow-sm">
            <div className="prose prose-sm max-w-none prose-p:leading-loose max-w-[100%] overflow-x-hidden relative">
              <MemoizedReactMarkdown content={message.content} streaming={message.streaming} />
              {message.streaming && <span className="streaming-cursor" aria-hidden="true" />}
            </div>
            
            {/* AI Action Bar - Only show when not streaming */}
            {!message.streaming && (
              <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-2 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5 -ml-1.5">
                    <button 
                      onClick={copyResponse}
                      className="flex items-center justify-center p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 transition-colors"
                      title="Copy response"
                    >
                      {copiedResponse ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    <button 
                      onClick={toggleTTS}
                      className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${isPlaying ? 'bg-sky-50 text-sky-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                      title={isPlaying ? "Stop audio" : "Read aloud"}
                    >
                      {isPlaying ? <Square size={12} className="fill-current" /> : <Volume2 size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 -mr-1.5">
                    <button 
                      className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-emerald-50 text-emerald-600/70 hover:text-emerald-700 text-xs font-medium transition-colors"
                      title="Convert to flashcards"
                    >
                      <Zap size={13} className="fill-emerald-600/20" /> To Flashcard
                    </button>
                    <button 
                      onClick={toggleSave}
                      className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${isSaved ? 'text-amber-500 hover:text-amber-600' : 'hover:bg-slate-100 text-slate-400 hover:text-amber-500'}`}
                      title={isSaved ? "Saved to Notebook" : "Save Note"}
                    >
                      <Star size={14} className={isSaved ? "fill-amber-500" : ""} />
                    </button>
                  </div>
                </div>

                {/* Quick Reply Pills (Only show on the very last AI message) */}
                {isLatest && !message.error && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    <button 
                      onClick={() => onQuickReply?.("Explain your last message like I'm 5 years old")}
                      className="flex items-center gap-1.5 bg-white dark:bg-[#1a1b23] border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-1.5 rounded-full text-xs transition-all shadow-sm"
                    >
                      <Lightbulb size={12} /> Explain like I'm 5
                    </button>
                    <button 
                      onClick={() => onQuickReply?.("Can you give me a real-world example of this?")}
                      className="flex items-center gap-1.5 bg-white dark:bg-[#1a1b23] border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-200 dark:hover:border-sky-800 hover:text-sky-700 dark:hover:text-sky-400 px-3 py-1.5 rounded-full text-xs transition-all shadow-sm"
                    >
                      <Layers size={12} /> Give an example
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {timeStr && (
          <p className="text-[10px] text-slate-300 mt-1.5 px-1">{timeStr}</p>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <span className="text-white text-[9px] font-bold">{userInitials}</span>
        </div>
      )}
    </motion.div>
  )
}