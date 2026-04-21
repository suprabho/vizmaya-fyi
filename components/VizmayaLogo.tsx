'use client'

import { useEffect } from 'react'
import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceColor,
} from '@rive-app/react-canvas'

interface VizmayaLogoProps {
  className?: string
  textColor?: string
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '')
  if (m.length !== 3 && m.length !== 6) return null
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

export default function VizmayaLogo({ className, textColor }: VizmayaLogoProps) {
  const { rive, RiveComponent } = useRive({
    src: '/vizmaya-logo.riv',
    autoplay: true,
  })

  const viewModel = useViewModel(rive, { useDefault: true })
  const instance = useViewModelInstance(viewModel, { rive })
  const color = useViewModelInstanceColor('textColor', instance)

  useEffect(() => {
    if (!textColor || !color?.setRgb) return
    const rgb = parseHex(textColor)
    if (!rgb) return
    color.setRgb(rgb.r, rgb.g, rgb.b)
  }, [textColor, color])

  return (
    <div className={className}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
