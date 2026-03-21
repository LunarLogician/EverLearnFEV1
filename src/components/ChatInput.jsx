import { useState, useRef, useCallback, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { Send, LogIn, Sparkles, Paperclip, X, FileText, CheckCircle, AlertCircle, Loader2, ImagePlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { documentService } from '../services'

export default function ChatInput({ isAuthenticated = false, disabled = false, onLoginClick, onLimitReached }) {
  const [input, setInput] = useState('')
  const [uploadedDoc, setUploadedDoc] = useState(null) // { id, name, status }
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const pollRef = useRef(null)
  const { sendMessage, loading, chatCount } = useChat()

  // Poll for document processing status every 2s until completed/failed
  const pollDocStatus = useCallback((docId) => {
    let attempts = 0
    const maxAttempts = 30

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setUploadedDoc(prev => prev ? { ...prev, status: 'failed' } : null)
        return
      }
      attempts++
      try {
        const data = await documentService.getDocument(docId)
        const status = data.document?.processingStatus
        setUploadedDoc(prev => prev ? { ...prev, status } : null)
        if (status === 'processing' || status === 'pending') {
          pollRef.current = setTimeout(poll, 2000)
        }
      } catch {
        pollRef.current = setTimeout(poll, 2000)
      }
    }
    pollRef.current = setTimeout(poll, 2000)
  }, [])

  useEffect(() => {
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  }, [])

  const processImage = useCallback((file) => {
    setImageError(null)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onerror = () => {
      setImageError('Failed to read image. Please try again.')
      setImageBase64(null)
      setImagePreview(null)
    }
    reader.onload = (e) => {
      setImageBase64(e.target.result)
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file')
      return
    }
    processImage(file)
  }

  const removeImage = useCallback(() => {
    setImageBase64(null)
    setImagePreview(null)
    setImageError(null)
  }, [])

  // Paste image from clipboard (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isAuthenticated) return
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) processImage(file)
          break
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [isAuthenticated, processImage])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const allowed = ['pdf', 'pptx', 'docx', 'jpg', 'jpeg', 'png', 'txt']
    const ext = file.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) {
      setUploadError(`Unsupported type. Allowed: ${allowed.join(', ')}`)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File must be under 10 MB')
      return
    }

    setUploadError(null)
    setUploading(true)
    setUploadedDoc({ id: null, name: file.name, status: 'uploading' })

    try {
      const data = await documentService.uploadDocument(file)
      const doc = data.document
      setUploadedDoc({ id: doc.id, name: file.name, status: doc.processingStatus })
      if (doc.processingStatus === 'processing' || doc.processingStatus === 'pending') {
        pollDocStatus(doc.id)
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.')
      setUploadedDoc(null)
    } finally {
      setUploading(false)
    }
  }

  const removeDoc = () => {
    if (pollRef.current) clearTimeout(pollRef.current)
    setUploadedDoc(null)
    setUploadError(null)
  }

  const handleInputClick = () => {
    if (!isAuthenticated) onLoginClick?.()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const hasContent = input.trim() || imageBase64
    if (!hasContent || loading || !isAuthenticated || disabled) return
    // Removed FREE_LIMIT check
    if (uploadedDoc && uploadedDoc.status !== 'completed') return

    try {
      const text = input.trim()
      const docId = uploadedDoc?.id || null
      const docInfo = uploadedDoc ? { name: uploadedDoc.name, type: uploadedDoc.name.split('.').pop().toUpperCase() } : null
      const imgData = imageBase64 || null
      setInput('')
      inputRef.current?.focus()
      if (uploadedDoc) removeDoc()
      if (imageBase64) removeImage()
      await sendMessage(text, docId, docInfo, imgData)
    } catch (error) {
      if (error?.response?.data?.upgradeRequired) {
        onLimitReached?.()
      }
      console.error('Failed to send message:', error)
    }
  }

  const isDocReady = !uploadedDoc || uploadedDoc.status === 'completed'
  const MAX_CHARS = 5000
  const charCount = input.length
  const charWarning = charCount > MAX_CHARS * 0.8 // Warning at 80%
  const charExceeded = charCount > MAX_CHARS
  const canSend = !!(input.trim() || imageBase64) && !loading && isAuthenticated && !disabled && isDocReady && !charExceeded

  const docStatusIcon = () => {
    if (!uploadedDoc) return null
    if (uploadedDoc.status === 'uploading') return <Loader2 size={14} className="animate-spin text-primary flex-shrink-0" />
    if (uploadedDoc.status === 'processing' || uploadedDoc.status === 'pending') return <Loader2 size={14} className="animate-spin text-amber-500 flex-shrink-0" />
    if (uploadedDoc.status === 'completed') return <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
    if (uploadedDoc.status === 'failed') return <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
    return <FileText size={14} className="text-slate-400 flex-shrink-0" />
  }

  const docStatusLabel = () => {
    if (!uploadedDoc) return ''
    if (uploadedDoc.status === 'uploading') return 'Uploading...'
    if (uploadedDoc.status === 'processing' || uploadedDoc.status === 'pending') return 'Processing...'
    if (uploadedDoc.status === 'completed') return 'Ready'
    if (uploadedDoc.status === 'failed') return 'Failed'
    return ''
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="px-4 pb-5 pt-2 max-w-3xl mx-auto w-full"
    >
      {/* Attachment badges + errors */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            key="image-attachment"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-2 inline-flex items-center gap-2 bg-white border border-blue-200 rounded-xl px-3 py-1.5 shadow-sm max-w-xs"
          >
            <img src={imagePreview} alt="preview" className="h-6 w-6 object-cover rounded flex-shrink-0" />
            <span className="text-xs text-slate-600 flex-shrink-0">Image attached</span>
            <button type="button" onClick={removeImage} className="text-slate-300 hover:text-slate-500 flex-shrink-0 ml-1 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        )}
        {imageError && (
          <motion.p key="image-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {imageError}
          </motion.p>
        )}
        {uploadedDoc && (
          <motion.div
            key="attachment"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mb-2 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm max-w-xs"
          >
            {docStatusIcon()}
            <span className="text-xs text-slate-700 truncate max-w-[150px]">{uploadedDoc.name}</span>
            <span className="text-xs text-slate-400 flex-shrink-0">{docStatusLabel()}</span>
            <button type="button" onClick={removeDoc} className="text-slate-300 hover:text-slate-500 flex-shrink-0 ml-1 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        )}
        {uploadError && (
          <motion.p key="upload-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {uploadError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.docx,.jpg,.jpeg,.png,.txt" onChange={handleFileChange} className="hidden" />
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

      {/* Unified input pill */}
      <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-md shadow-black/[0.04] ${
        disabled
          ? 'border-gray-100 opacity-60'
          : 'border-gray-200/80 hover:border-gray-300 focus-within:border-emerald-700/30 focus-within:shadow-lg focus-within:shadow-emerald-900/[0.05]'
      }`}>
        <div className="flex items-center px-3 gap-1">
          {isAuthenticated && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => imageInputRef.current?.click()}
              disabled={!!imageBase64}
              title="Attach an image (or paste Ctrl+V)"
              className={`p-2 transition-colors rounded-lg flex-shrink-0 ${
                imageBase64
                  ? 'text-blue-500 bg-blue-50'
                  : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              <ImagePlus size={17} />
            </motion.button>
          )}
          {isAuthenticated && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !!uploadedDoc}
              title="Attach a document (PDF, DOCX, PPTX, TXT)"
              className={`p-2 transition-colors rounded-lg flex-shrink-0 ${
                uploadedDoc
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              <Paperclip size={17} />
            </motion.button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              const text = e.target.value
              if (text.length <= MAX_CHARS) setInput(text)
            }}
            onClick={handleInputClick}
            placeholder={
              !isAuthenticated ? 'Sign in to start chatting...'
              : imageBase64 ? 'Add a message about your image...'
              : uploadedDoc?.status === 'completed' ? `Ask about "${uploadedDoc.name}"...`
              : uploadedDoc ? 'Waiting for document to process...'
              : 'Ask anything about your studies...'
            }
            disabled={loading || disabled}
            className={`flex-1 bg-transparent outline-none text-slate-800 text-sm placeholder:text-slate-400 py-4 min-w-0 ${
              !isAuthenticated ? 'cursor-pointer' : ''
            }`}
          />

          <motion.button
            whileHover={canSend ? { scale: 1.08 } : {}}
            whileTap={canSend ? { scale: 0.93 } : {}}
            type="submit"
            disabled={!canSend}
            onClick={!isAuthenticated ? () => onLoginClick?.() : undefined}
            className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
              canSend
                ? 'bg-gradient-to-br from-emerald-900 to-emerald-600 text-white shadow-sm shadow-emerald-900/25'
                : 'bg-gray-100 text-slate-300'
            }`}
          >
            {loading ? (
              <div className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
            ) : !isAuthenticated ? (
              <LogIn size={15} />
            ) : (
              <Send size={15} />
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2.5">
        <p className="text-xs text-slate-400">
          {!isAuthenticated
            ? 'Create an account or sign in to start chatting'
            : ''
          }
        </p>
        {isAuthenticated && input.length > 0 && (
          <p className={`text-xs font-medium transition-colors ${
            charExceeded ? 'text-red-500'
            : charWarning ? 'text-amber-500'
            : 'text-slate-400'
          }`}>
            {charCount} / {MAX_CHARS}
          </p>
        )}
      </div>
    </motion.form>
  )
}
