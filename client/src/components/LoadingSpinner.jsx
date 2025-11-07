export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-white/20 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  )
}

