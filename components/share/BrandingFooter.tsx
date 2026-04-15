'use client'

export default function BrandingHeader({ title }: { title: string }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3"
      style={{
        background: 'linear-gradient(rgba(0,0,0,0.4), transparent)',
      }}
    >
      <span
        className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.15em] opacity-70"
        style={{ color: 'var(--color-muted)' }}
      >
        {title}
      </span>
      <span
        className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.15em] opacity-70"
        style={{ color: 'var(--color-accent)' }}
      >
        vizmaya
      </span>
    </div>
  )
}
