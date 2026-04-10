import { getParagraphs } from '@/lib/content'
import { resolveAnchor } from '@/lib/contentAnchors'
import type { ContentSection } from '@/lib/content'
import type { StoryConfig, ResolvedUnit } from '@/lib/storyConfig.types'

/**
 * Slice paragraphs according to a spec:
 *  - undefined → all
 *  - number   → single paragraph at that index
 *  - [a, b]   → Array.slice(a, b)
 */
function sliceParagraphs(
  all: string[],
  spec: number | [number, number] | undefined
): string[] {
  if (spec === undefined) return all
  if (typeof spec === 'number') return all.slice(spec, spec + 1)
  return all.slice(spec[0], spec[1])
}

/**
 * Flatten sections + subsections from a StoryConfig into renderable units.
 * Each unit is one viewport-tall snap target. Sections with N subsections
 * expand into N units that share the parent's map state and chart but have
 * their own text anchor.
 *
 * Returns both desktop and mobile unit arrays. Mobile units expand when
 * `mobileParagraphs` is present on a section/subsection.
 */
export function resolveUnits(
  slug: string,
  sections: ContentSection[],
  config: StoryConfig
): { units: ResolvedUnit[]; mobileUnits: ResolvedUnit[]; shareUnits: ResolvedUnit[]; hasMobileOverrides: boolean; hasShareOverrides: boolean } {
  const units: ResolvedUnit[] = []
  const mobileUnits: ResolvedUnit[] = []
  const shareUnits: ResolvedUnit[] = []
  let hasMobileOverrides = false
  let hasShareOverrides = false

  config.sections.forEach((section, parentIndex) => {
    const subs = section.subsections
    if (subs && subs.length > 0) {
      subs.forEach((sub, subIndex) => {
        const md = resolveAnchor(sections, sub.text)
        if (!md) console.warn(`[story:${slug}] anchor not found: "${sub.text}"`)
        const allParagraphs = md ? getParagraphs(md) : []
        const heading = sub.heading ?? md?.heading

        // Desktop unit (always one per subsection)
        units.push({
          parentIndex,
          subIndex,
          parentConfig: section,
          heading,
          paragraphs: sliceParagraphs(allParagraphs, sub.paragraphs),
        })

        // Mobile units — expand if mobileParagraphs present.
        if (sub.mobileParagraphs) {
          hasMobileOverrides = true
          sub.mobileParagraphs.forEach((mobileSpec, sliceIdx) => {
            mobileUnits.push({
              parentIndex,
              subIndex,
              parentConfig: section,
              heading: sliceIdx === 0 ? heading : undefined,
              paragraphs: sliceParagraphs(allParagraphs, mobileSpec),
            })
          })
        } else {
          mobileUnits.push({
            parentIndex,
            subIndex,
            parentConfig: section,
            heading,
            paragraphs: sliceParagraphs(allParagraphs, sub.paragraphs),
          })
        }

        // Share units — expand if shareParagraphs present.
        if (sub.shareParagraphs) {
          hasShareOverrides = true
          sub.shareParagraphs.forEach((shareSpec, sliceIdx) => {
            shareUnits.push({
              parentIndex,
              subIndex,
              parentConfig: section,
              heading: sliceIdx === 0 ? heading : undefined,
              paragraphs: sliceParagraphs(allParagraphs, shareSpec),
            })
          })
        } else {
          shareUnits.push({
            parentIndex,
            subIndex,
            parentConfig: section,
            heading,
            paragraphs: sliceParagraphs(allParagraphs, sub.paragraphs),
          })
        }
      })
    } else if (section.text) {
      const md = resolveAnchor(sections, section.text)
      if (!md) console.warn(`[story:${slug}] anchor not found: "${section.text}"`)
      const allParagraphs = md ? getParagraphs(md) : []
      const heading = section.heading ?? md?.heading

      // Desktop unit
      units.push({
        parentIndex,
        subIndex: 0,
        parentConfig: section,
        heading,
        paragraphs: sliceParagraphs(allParagraphs, section.paragraphs),
      })

      // Mobile units — expand if mobileParagraphs present.
      if (section.mobileParagraphs) {
        hasMobileOverrides = true
        section.mobileParagraphs.forEach((mobileSpec, sliceIdx) => {
          mobileUnits.push({
            parentIndex,
            subIndex: 0,
            parentConfig: section,
            heading: sliceIdx === 0 ? heading : undefined,
            paragraphs: sliceParagraphs(allParagraphs, mobileSpec),
          })
        })
      } else {
        mobileUnits.push({
          parentIndex,
          subIndex: 0,
          parentConfig: section,
          heading,
          paragraphs: sliceParagraphs(allParagraphs, section.paragraphs),
        })
      }

      // Share units — expand if shareParagraphs present.
      if (section.shareParagraphs) {
        hasShareOverrides = true
        section.shareParagraphs.forEach((shareSpec, sliceIdx) => {
          shareUnits.push({
            parentIndex,
            subIndex: 0,
            parentConfig: section,
            heading: sliceIdx === 0 ? heading : undefined,
            paragraphs: sliceParagraphs(allParagraphs, shareSpec),
          })
        })
      } else {
        shareUnits.push({
          parentIndex,
          subIndex: 0,
          parentConfig: section,
          heading,
          paragraphs: sliceParagraphs(allParagraphs, section.paragraphs),
        })
      }
    }
  })

  return { units, mobileUnits, shareUnits, hasMobileOverrides, hasShareOverrides }
}
