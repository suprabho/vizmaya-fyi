'use client'

import {
  useRive,
  useViewModel,
  useViewModelInstance,
} from '@rive-app/react-canvas'

interface VizmayaLogoProps {
  className?: string
}

export default function VizmayaLogo({ className }: VizmayaLogoProps) {
  const { rive, RiveComponent } = useRive({
    src: '/vizmaya-logo.riv',
    autoplay: true,
  })

  const viewModel = useViewModel(rive, { useDefault: true })
  useViewModelInstance(viewModel, { rive })

  return (
    <div className={className}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
