'use client'

import { ReactNode, useRef } from 'react'
import { useInView } from '@/lib/use-in-view'
import { ProseBlock } from '@/types/story'

function formatInlineMarkdown(text: string) {
  const parts: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    // Italic: *text*
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/)

    const firstMatch = [boldMatch, italicMatch]
      .filter(Boolean)
      .sort((a, b) => (a!.index ?? 0) - (b!.index ?? 0))[0]

    if (!firstMatch || firstMatch.index === undefined) {
      parts.push(remaining)
      break
    }

    if (firstMatch.index > 0) {
      parts.push(remaining.slice(0, firstMatch.index))
    }

    if (firstMatch === boldMatch) {
      parts.push(
        <strong
          key={key++}
          className="font-[family-name:var(--font-mono)] font-bold"
          style={{ color: 'var(--color-accent)' }}
        >
          {firstMatch[1]}
        </strong>
      )
    } else {
      parts.push(<em key={key++}>{firstMatch[1]}</em>)
    }

    remaining = remaining.slice(firstMatch.index + firstMatch[0].length)
  }

  return parts
}

export default function ProseSection({ block }: { block: ProseBlock }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { threshold: 0.1 })

  return (
    <section
      ref={ref}
      className="max-w-[640px] mx-auto px-8 py-16 transition-opacity duration-700"
      style={{ opacity: isInView ? 1 : 0 }}
    >
      {block.paragraphs.map((p, i) => (
        <p
          key={i}
          className="font-[family-name:var(--font-serif)] text-[1.15rem] leading-[1.85] mb-6"
          style={{ color: 'var(--color-text)' }}
        >
          {formatInlineMarkdown(p)}
        </p>
      ))}
    </section>
  )
}
