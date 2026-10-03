'use client'

import { useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Loader2,
  Quote,
  Minus,
} from 'lucide-react'
import { uploadJobImage } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'

interface TiptapToolbarProps {
  editor: Editor | null
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  if (!editor) {
    return null
  }

  // Handle setting link
  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href || ''
    setLinkUrl(previousUrl)
    setShowLinkModal(true)
  }

  const applyLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      let url = linkUrl.trim()
      if (!/^https?:\/\//i.test(url) && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
        url = `https://${url}`
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setShowLinkModal(false)
    setLinkUrl('')
  }

  // Handle uploading and inserting image
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)
      const publicUrl = await uploadJobImage(file)
      editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Tải ảnh lên thất bại'
      alert(msg)
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-2 rounded-t-xl">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* History */}
      <div className="flex items-center gap-0.5 pr-1 border-r border-border/70">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
          className="p-1.5 rounded-md hover:bg-muted text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
          className="p-1.5 rounded-md hover:bg-muted text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Tiêu đề 1 (H1)"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('heading', { level: 1 })
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Tiêu đề 2 (H2)"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('heading', { level: 2 })
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Tiêu đề 3 (H3)"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('heading', { level: 3 })
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <Heading3 className="h-4 w-4" />
        </button>
      </div>

      {/* Text Formats */}
      <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Đậm (Ctrl+B)"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('bold')
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Nghiêng (Ctrl+I)"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('italic')
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Gạch ngang"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('strike')
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Trích dẫn"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('blockquote')
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <Quote className="h-4 w-4" />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Danh sách dấu chấm"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('bulletList')
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Danh sách số thứ tự"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('orderedList')
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Đường kẻ ngang phân cách"
          className="p-1.5 rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 px-1 border-r border-border/70">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Căn lề trái"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive({ textAlign: 'left' })
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Căn giữa"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive({ textAlign: 'center' })
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Căn lề phải"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive({ textAlign: 'right' })
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Căn đều 2 bên"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive({ textAlign: 'justify' })
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <AlignJustify className="h-4 w-4" />
        </button>
      </div>

      {/* Link & Media */}
      <div className="flex items-center gap-0.5 pl-1">
        <button
          type="button"
          onClick={handleSetLink}
          title="Thêm liên kết"
          className={cn(
            "p-1.5 rounded-md transition-colors",
            editor.isActive('link')
              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          )}
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Xóa liên kết"
            className="p-1.5 rounded-md hover:bg-muted text-red-600 hover:text-red-700 transition-colors"
          >
            <Unlink className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
          title="Tải ảnh lên và chèn vào nội dung"
          className="p-1.5 rounded-md hover:bg-muted text-foreground/80 hover:text-foreground disabled:opacity-50 transition-colors flex items-center gap-1 text-xs"
        >
          {isUploadingImage ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
          ) : (
            <ImageIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
        </button>
      </div>

      {/* Link Input Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-xl space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Chèn liên kết URL</h4>
            <form onSubmit={applyLink} className="space-y-3">
              <input
                type="text"
                autoFocus
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                >
                  Áp dụng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
