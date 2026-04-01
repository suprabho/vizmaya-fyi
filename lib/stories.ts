import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Frontmatter } from '@/types/story'

const STORIES_DIR = path.join(process.cwd(), 'content/stories')

export async function getAllStoryIds(): Promise<string[]> {
  return fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export async function getStoryById(id: string) {
  const file = fs.readFileSync(path.join(STORIES_DIR, `${id}.md`), 'utf8')
  const { data, content } = matter(file)
  return { frontmatter: data as Frontmatter, content }
}

export async function getAllStories() {
  const ids = await getAllStoryIds()
  return Promise.all(
    ids.map(async (id) => {
      const { frontmatter } = await getStoryById(id)
      return { id, ...frontmatter }
    })
  )
}
