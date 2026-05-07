import React, { createContext, useContext, useState } from 'react'

const AIContext = createContext()

export function AIProvider({ children }) {
  const [aiEnabled, setAiEnabled] = useState(true)
  return (
    <AIContext.Provider value={{ aiEnabled, toggle: () => setAiEnabled(v => !v) }}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() { return useContext(AIContext) }

const F = "'Bricolage Grotesque', sans-serif"

export function AIToggleBtn() {
  const { aiEnabled, toggle } = useAI()
  return (
    <button onClick={toggle} style={{
      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
      background: aiEnabled ? '#c8b8f0' : '#f0ece6',
      color: aiEnabled ? '#3a1a80' : '#8888aa',
      fontWeight: 800, fontSize: 11, fontFamily: F, letterSpacing: '1px',
      transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: aiEnabled ? '#3a1a80' : '#ccc',
        display: 'inline-block',
        boxShadow: aiEnabled ? '0 0 6px #7c3aed' : 'none',
        transition: 'all .2s',
      }} />
      AI {aiEnabled ? 'ON' : 'OFF'}
    </button>
  )
}
