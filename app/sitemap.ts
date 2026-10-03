import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globalcareergate.com'

  // 1. Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/tin-tuyen-dung`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    const supabase = await createClient()

    // 2. Fetch all published jobs for dynamic sitemap
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.error('Sitemap: Error fetching jobs:', jobsError)
    }

    const jobRoutes: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
      url: `${siteUrl}/tin-tuyen-dung/${job.slug}`,
      lastModified: new Date(job.updated_at || job.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // 3. Fetch all categories and locations for filtered sitemap discovery
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('slug, type')

    if (catError) {
      console.error('Sitemap: Error fetching categories:', catError)
    }

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${siteUrl}/tin-tuyen-dung?${cat.type === 'location' ? 'location' : 'category'}=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...jobRoutes, ...categoryRoutes]
  } catch (error) {
    console.error('Sitemap generation fallback error:', error)
    return staticRoutes
  }
}
