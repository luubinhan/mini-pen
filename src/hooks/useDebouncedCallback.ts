import { useEffect, useMemo, useRef } from 'react'

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useMemo(
    () =>
      (...args: Args) => {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args)
        }, delayMs)
      },
    [delayMs],
  )
}
