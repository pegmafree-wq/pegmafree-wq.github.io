import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    const move = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const label = target.closest('[data-cursor]')?.getAttribute('data-cursor')
      if (label) {
        cursor.classList.add('hovering')
        cursor.textContent = label
      }
    }

    const out = () => {
      cursor.classList.remove('hovering')
      cursor.textContent = ''
    }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor" />
}
