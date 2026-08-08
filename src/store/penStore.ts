import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_CSS, DEFAULT_HTML } from '../lib/defaults'

export type PenState = {
  html: string
  css: string
  resetRevision: number
  setHtml: (html: string) => void
  setCss: (css: string) => void
  reset: () => void
  clear: () => void
}

export const usePenStore = create<PenState>()(
  persist(
    (set) => ({
      html: DEFAULT_HTML,
      css: DEFAULT_CSS,
      resetRevision: 0,
      setHtml: (html) => set({ html }),
      setCss: (css) => set({ css }),
      reset: () =>
        set((state) => ({
          html: DEFAULT_HTML,
          css: DEFAULT_CSS,
          resetRevision: state.resetRevision + 1,
        })),
      clear: () =>
        set((state) => ({
          html: '',
          css: '',
          resetRevision: state.resetRevision + 1,
        })),
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
