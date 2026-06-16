import { useEffect, useRef } from 'react'

export default function MatrixBackground({ opacity = 0.28 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const chars = '01アイウエオカキクケコサシスセソ<>[]{}|/\\?!@#$%^&*ABCDEFabcdef'.split('')
    const fontSize = 13
    const cols   = Math.floor(canvas.width / fontSize)
    const drops  = Array(cols).fill(1)

    let animId
    const draw = () => {
      ctx.fillStyle = 'rgba(2,11,20,0.048)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char  = chars[Math.floor(Math.random() * chars.length)]
        const alpha = Math.random() > 0.92 ? 0.85 : 0.1
        ctx.fillStyle = `rgba(0,255,140,${alpha})`
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        opacity, pointerEvents: 'none',
      }}
    />
  )
}
