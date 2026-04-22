import { redirect, notFound } from 'next/navigation'
import { isAuthed } from '@/lib/adminAuth'
import { getContentSource } from '@/lib/contentSource'
import EditorClient from '@/components/admin/EditorClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditStoryPage({ params }: Props) {
  const { slug } = await params
  if (!(await isAuthed())) redirect(`/admin/login?next=/admin/${slug}`)

  const src = getContentSource()
  const [markdown, config_yaml, share_yaml, charts] = await Promise.all([
    src.readMarkdown(slug),
    src.readConfigYaml(slug),
    src.readShareYaml(slug),
    src.listChartIds(slug),
  ])
  if (markdown == null) notFound()

  return (
    <EditorClient
      slug={slug}
      initial={{
        markdown,
        config_yaml: config_yaml ?? '',
        share_yaml: share_yaml ?? '',
        charts,
      }}
    />
  )
}
