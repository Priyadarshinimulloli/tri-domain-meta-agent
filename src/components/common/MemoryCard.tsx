import { motion } from 'framer-motion'
import { Brain, Trash2, Star, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatRelativeDate } from '@/utils'
import type { Memory } from '@/types'
import axios from 'axios'
import { STORAGE_KEYS } from '@/utils/constants'
import { toast } from 'sonner'

interface MemoryCardProps {
  memory: Memory
  onDelete?: (id: string) => void
}

// Parse markdown links: [text](url)
function parseMemoryText(text: string) {
  const linkRegex = /\[(.*?)\]\((.*?)\)/g
  const links: Array<{ text: string; url: string }> = []
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
    })
  }

  const plainText = text.replace(linkRegex, '$1')
  return { plainText, links }
}

async function downloadFile(url: string, filename: string) {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Download the file with authentication
    const response = await axios.get(url, {
      headers,
      responseType: 'blob',
    })

    // Create a blob URL and trigger download
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    
    toast.success(`Downloaded ${filename}`)
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Failed to download file')
  }
}

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const importance = Math.round(memory.importance_score * 100)
  const { plainText, links } = parseMemoryText(memory.memory_text)
  const hasFileLink = links.some((link) => link.url.includes('/files/download-resume'))

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="group overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <Badge variant={memory.category as 'career' | 'health' | 'finance'} className="text-[10px] capitalize">
                {memory.category}
              </Badge>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDelete(memory.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          <p className="text-sm leading-relaxed mb-3">{plainText}</p>

          {hasFileLink && (
            <div className="mb-3 flex flex-wrap gap-2">
              {links.map((link, idx) => {
                // Use the link text as filename directly (it should be the actual filename now)
                const filename = link.text || 'resume'
                return (
                  <button
                    key={idx}
                    onClick={() => downloadFile(link.url, filename)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition"
                    title={link.text}
                  >
                    <Download className="h-3 w-3" />
                    {link.text}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-muted-foreground">Importance</span>
              <Progress value={importance} className="w-16 h-1" />
              <span className="text-xs font-medium">{importance}%</span>
            </div>
            <span className="text-xs text-muted-foreground">{formatRelativeDate(memory.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
