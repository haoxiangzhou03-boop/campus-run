export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="fixed left-1/2 top-16 -translate-x-1/2 z-[100] bg-gray-900/90 text-white text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
      {toast}
    </div>
  )
}