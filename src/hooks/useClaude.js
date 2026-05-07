// ─── useClaude ─────────────────────────────────────────────────────────────
// Custom hook that streams a Claude response into a string ref.
//
// Usage:
//   const { text, loading, run } = useClaude()
//   run("Your prompt here")  ← triggers a new streaming call
//
// The `text` state updates in real-time as tokens arrive.

import { useState, useCallback } from 'react'

const MODEL = 'claude-sonnet-4-20250514'

export function useClaude() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const run = useCallback(async (prompt) => {
    setText('')
    setLoading(true)

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          stream: true,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!resp.ok) {
        setText('(AI unavailable — check API key)')
        setLoading(false)
        return
      }

      const reader = resp.body.getReader()
      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const j = JSON.parse(data)
              if (j.type === 'content_block_delta' && j.delta?.text) {
                setText(prev => prev + j.delta.text)
              }
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      setText('(AI unavailable in this environment)')
    }

    setLoading(false)
  }, [])

  return { text, loading, run }
}
