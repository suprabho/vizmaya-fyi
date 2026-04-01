import { FooterBlock as FooterBlockType } from '@/types/story'

export default function FooterBlock({ block }: { block: FooterBlockType }) {
  return (
    <div className="text-center py-8">
      <span
        className="font-[family-name:var(--font-mono)] text-[0.7rem] tracking-[0.12em]"
        style={{ color: 'var(--color-muted)' }}
      >
        <span style={{ color: 'var(--color-accent)' }}>vizzmaya</span>
        {' · '}
        {block.text.replace(/^vizzmaya\s*·?\s*/, '')}
      </span>
    </div>
  )
}
