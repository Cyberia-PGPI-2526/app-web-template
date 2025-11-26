import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {icon}
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
