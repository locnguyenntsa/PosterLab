import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/store/useToastStore'

/** Copy `text`, with a legacy fallback for non-secure contexts / old Safari. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path below
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/**
 * Flat square icon button that copies `value` to the clipboard. Shows a brief
 * green check + a success toast on copy. Reusable for any short code/value.
 */
export function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const push = useToastStore((s) => s.push)

  async function handleCopy() {
    if (await copyText(value)) {
      setCopied(true)
      push('Copied to clipboard')
      setTimeout(() => setCopied(false), 1600)
    } else {
      push('Press Ctrl / ⌘ + C to copy', 'info')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : label}
      title={label}
      className={cn(
        'grid size-10 shrink-0 cursor-pointer place-items-center border border-line text-mute transition-colors hover:bg-line hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      {copied ? (
        <Check className="size-5 text-success" strokeWidth={2.5} aria-hidden />
      ) : (
        <Copy className="size-5" strokeWidth={1.5} aria-hidden />
      )}
    </button>
  )
}
