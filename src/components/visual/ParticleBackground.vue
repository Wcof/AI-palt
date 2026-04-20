<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'

defineProps<{ class?: string }>()
const reducedMotion = usePrefersReducedMotion()
const canvasRef = ref<HTMLCanvasElement>()

type P = { x: number; y: number; vx: number; vy: number; r: number }

onMounted(() => {
  if (reducedMotion.value) return
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const particles: P[] = []
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const rect = canvas.getBoundingClientRect()
  const count = Math.max(38, Math.min(80, Math.floor(rect.width / 24)))
  for (let i = 0; i < count; i++) {
    particles.push({ x: Math.random() * rect.width, y: Math.random() * rect.height, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: 1.2 + Math.random() * 1.6 })
  }

  let raf = 0
  const tick = () => {
    const { width, height } = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, width, height)
    ctx.globalAlpha = 1
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy
      if (p.x < -20) p.x = width + 20; if (p.x > width + 20) p.x = -20
      if (p.y < -20) p.y = height + 20; if (p.y > height + 20) p.y = -20
    }
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i]
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j]
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy
        if (d2 > 140 * 140) continue
        const alpha = Math.max(0, 1 - Math.sqrt(d2) / 140)
        ctx.strokeStyle = `rgba(0, 180, 255, ${alpha * 0.14})`
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
      }
    }
    for (const p of particles) {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
      grad.addColorStop(0, 'rgba(0, 180, 255, 0.32)'); grad.addColorStop(1, 'rgba(0, 180, 255, 0)')
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(0, 48, 90, 0.45)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  window.addEventListener('resize', resize)
  onUnmounted(() => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) })
})
</script>

<template>
  <canvas ref="canvasRef" :class="$attrs.class" aria-hidden="true" />
</template>
