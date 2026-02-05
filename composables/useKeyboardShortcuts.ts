import { useMagicKeys, whenever } from '@vueuse/core'

interface KeyboardShortcutsOptions {
  onCapture?: () => void
  onInbox?: () => void
  onNextActions?: () => void
  onProjects?: () => void
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const router = useRouter()
  const keys = useMagicKeys()

  // Cmd+K or Ctrl+K: Focus capture input
  const captureKey = computed(() => keys['Meta+k']?.value || keys['Control+k']?.value)
  whenever(captureKey, () => {
    if (options.onCapture) {
      options.onCapture()
    }
  })

  // G then I: Go to Inbox (vim-style navigation)
  const gKey = keys['g']
  const iKey = keys['i']
  const nKey = keys['n']
  const pKey = keys['p']

  let gPressed = false
  let gTimeout: ReturnType<typeof setTimeout> | null = null

  // Watch for 'g' key to start sequence
  whenever(gKey, () => {
    // Don't trigger if user is typing in an input
    if (isTypingInInput()) return

    gPressed = true
    // Reset after 1 second if no follow-up key
    if (gTimeout) clearTimeout(gTimeout)
    gTimeout = setTimeout(() => {
      gPressed = false
    }, 1000)
  })

  // G + I: Go to Inbox
  whenever(iKey, () => {
    if (!gPressed || isTypingInInput()) return
    gPressed = false
    if (gTimeout) clearTimeout(gTimeout)

    if (options.onInbox) {
      options.onInbox()
    } else {
      router.push('/inbox')
    }
  })

  // G + N: Go to Next Actions
  whenever(nKey, () => {
    if (!gPressed || isTypingInInput()) return
    gPressed = false
    if (gTimeout) clearTimeout(gTimeout)

    if (options.onNextActions) {
      options.onNextActions()
    } else {
      router.push('/next-actions')
    }
  })

  // G + P: Go to Projects
  whenever(pKey, () => {
    if (!gPressed || isTypingInInput()) return
    gPressed = false
    if (gTimeout) clearTimeout(gTimeout)

    if (options.onProjects) {
      options.onProjects()
    } else {
      router.push('/projects')
    }
  })

  return {
    keys,
  }
}

// Helper to check if user is typing in an input/textarea
function isTypingInInput(): boolean {
  const activeElement = document.activeElement
  if (!activeElement) return false

  const tagName = activeElement.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'textarea') return true
  if ((activeElement as HTMLElement).isContentEditable) return true

  return false
}

// Shortcut definitions for display in Settings
export const KEYBOARD_SHORTCUTS = [
  {
    key: isMac() ? '⌘K' : 'Ctrl+K',
    description: 'Focus capture input',
    category: 'Capture',
  },
  {
    key: 'G then I',
    description: 'Go to Inbox',
    category: 'Navigation',
  },
  {
    key: 'G then N',
    description: 'Go to Next Actions',
    category: 'Navigation',
  },
  {
    key: 'G then P',
    description: 'Go to Projects',
    category: 'Navigation',
  },
  {
    key: isMac() ? '⌘Enter' : 'Ctrl+Enter',
    description: 'Save/Submit form',
    category: 'Actions',
  },
  {
    key: 'Escape',
    description: 'Close modal/Cancel',
    category: 'Actions',
  },
]

// Helper to detect Mac platform
function isMac(): boolean {
  if (typeof navigator === 'undefined') return true // SSR default
  return navigator.platform.toLowerCase().includes('mac')
}

// Export isMac for use in components
export { isMac }
