'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { TiptapToolbar } from './TiptapToolbar'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: string
  onChange: (richText: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

const emptySubscribe = () => () => {}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Nhập nội dung chi tiết công việc, yêu cầu ứng viên, chế độ phúc lợi...',
  className,
  minHeight = '250px',
}: TiptapEditorProps) {
  // React 19 recommended hydration check avoiding cascading effect renders
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-600 underline font-medium hover:text-red-700',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-4 shadow-sm border border-border',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-muted-foreground/60 before:float-left before:pointer-events-none',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none p-4 min-h-[250px]',
          'prose-headings:font-bold prose-headings:text-foreground',
          'prose-p:text-foreground/90 prose-p:leading-relaxed',
          'prose-li:text-foreground/90',
          'prose-blockquote:border-l-red-500 prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  // Sync content if changed externally (e.g. loading async job data in edit form)
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      if (editor.getText() === '' && content === '') {
        return
      }
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!isMounted) {
    return (
      <div
        className={cn(
          'w-full rounded-xl border border-border bg-card animate-pulse',
          className
        )}
        style={{ minHeight }}
      >
        <div className="h-10 border-b border-border bg-muted/40 rounded-t-xl" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-border bg-card text-card-foreground shadow-xs focus-within:ring-2 focus-within:ring-red-500/30 focus-within:border-red-500/50 transition-all flex flex-col overflow-hidden',
        className
      )}
    >
      <TiptapToolbar editor={editor} />
      <div
        className="flex-1 cursor-text"
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
