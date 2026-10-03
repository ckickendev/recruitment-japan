import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, Flame, Briefcase, Calendar } from 'lucide-react'
import type { JobWithCategory } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface JobCardProps {
  job: JobWithCategory
}

export function JobCard({ job }: JobCardProps) {
  const fallbackThumbnail = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
  const imageUrl = job.thumbnail_url || fallbackThumbnail

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/5">
      <div>
        {/* Thumbnail Header */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={job.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            {job.category?.name ? (
              <span className="rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {job.category.name}
              </span>
            ) : (
              <span className="rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                Việc làm
              </span>
            )}

            {job.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-red-500/30">
                <Flame className="h-3.5 w-3.5 fill-current" />
                HOT
              </span>
            )}
          </div>

          {/* Location on Image Bottom */}
          {job.location && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white/95 drop-shadow-md">
              <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="line-clamp-1">{job.location}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Salary Highlight */}
          {job.salary && (
            <div className="inline-block rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-1 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">
              {job.salary}
            </div>
          )}

          {/* Job Title */}
          <h3 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-red-600 line-clamp-2">
            <Link href={`/tin-tuyen-dung/${job.slug}`}>
              {job.title}
            </Link>
          </h3>

          {/* Key metadata */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground pt-1">
            {job.working_hours && (
              <span className="line-clamp-1">
                {job.working_hours}
              </span>
            )}
            {job.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(job.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-border/60 p-4 px-5 bg-muted/20">
        <Link
          href={`/tin-tuyen-dung/${job.slug}`}
          className="flex items-center justify-between text-xs sm:text-sm font-semibold text-foreground group-hover:text-red-600 transition-colors"
        >
          <span>Xem chi tiết công việc</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border/80 group-hover:border-red-500/40 group-hover:bg-red-50 dark:group-hover:bg-red-950/40 transition-colors">
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  )
}
