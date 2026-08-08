import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_CSS, DEFAULT_HTML } from '../lib/defaults'

export type PenState = {
  html: string
  css: string
  setHtml: (html: string) => void
  setCss: (css: string) => void
  reset: () => void
}

export const usePenStore = create<PenState>()(
  persist(
    (set) => ({
      html: DEFAULT_HTML,
      css: DEFAULT_CSS,
      setHtml: (html) => set({ html }),
      setCss: (css) => set({ css }),
      reset: () => set({ html: DEFAULT_HTML, css: DEFAULT_CSS }),
    }),
    {
      name: 'mini-pen',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ html: state.html, css: state.css }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('mini-pen: failed to rehydrate from localStorage', error)
        }
        return state
      },
    },
  ),
)
