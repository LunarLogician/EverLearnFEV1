export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3.5 bg-slate-50 rounded-2xl rounded-bl-sm">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-slate-300"
          style={{ animation: 'typing-bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  )
}
