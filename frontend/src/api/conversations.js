// Client-side registry of conversations, persisted in localStorage.
// Each entry: { id: thread_id, title: string }. Most recent first.

const STORAGE_KEY = 'chat_conversations'

export const conversationsStore = {
  list() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (error) {
      console.error('Error reading conversations:', error)
      return []
    }
  },

  save(conversations) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  },

  // Add a new conversation (or move an existing one to the top).
  upsert(id, title) {
    const conversations = this.list().filter((c) => c.id !== id)
    const existing = this.list().find((c) => c.id === id)
    conversations.unshift({ id, title: title || existing?.title || 'New Chat' })
    this.save(conversations)
    return conversations
  },

  // Rename a conversation in place (preserves list order).
  rename(id, title) {
    const conversations = this.list().map((c) =>
      c.id === id ? { ...c, title } : c
    )
    this.save(conversations)
    return conversations
  },

  remove(id) {
    const conversations = this.list().filter((c) => c.id !== id)
    this.save(conversations)
    return conversations
  },

  // Derive a short title from the first user message.
  titleFrom(message) {
    const trimmed = message.trim().replace(/\s+/g, ' ')
    return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed
  },
}
