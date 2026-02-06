import { useEffect } from "react"

export default function SwipeRefreshWrapper({ children }) {
  useEffect(() => {
    let touchStartY = 0

    function handleTouchStart(e) {
      touchStartY = e.touches[0].clientY
    }

    function handleTouchEnd(e) {
      const touchEndY = e.changedTouches[0].clientY
      const diff = touchEndY - touchStartY

      if (diff > 100 && window.scrollY === 0) {
        window.location.reload()
      }
    }

    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  return <>{children}</>
}