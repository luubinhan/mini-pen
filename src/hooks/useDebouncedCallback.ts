import { useEffect, useMemo, useRef } from 'react'

export type DebouncedCallback<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void
}

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): DebouncedCallback<Args> {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useMemo(() => {
    const cancel = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const run = (...args: Args) => {
      cancel()
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        callbackRef.current(...args)
      }, delayMs)
    }

    return Object.assign(run, { cancel })
  }, [delayMs])

  useEffect(() => () => debouncedCallback.cancel(), [debouncedCallback])

  return debouncedCallback
}
