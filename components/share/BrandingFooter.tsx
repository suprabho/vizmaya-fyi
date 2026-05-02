'use client'

export const DEFAULT_SHARE_LOGO = '/vizmaya-logo-01.svg'

export default function BrandingHeader({
  title,
  logo,
}: {
  title: string
  logo?: string
}) {
  const logoSrc = logo ?? DEFAULT_SHARE_LOGO
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-3">
      <span
        className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.15em] opacity-70"
        style={{ color: 'var(--color-muted)' }}
      >
        {title}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.15em] opacity-70"
          style={{ color: 'var(--color-accent)', marginTop: 3 }}
        >
          vizmaya
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          className="block"
          style={{ height: 24, width: 'auto' }}
        />
      </div>
    </div>
  )
}
