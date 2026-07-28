import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const PageLoadingContext = createContext(null)

export function PageLoadingProvider({ children }) {
  const [count, setCount] = useState(0)

  const startLoading = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  const stopLoading = useCallback(() => {
    setCount((c) => Math.max(0, c - 1))
  }, [])

  const value = useMemo(
    () => ({ isPageLoading: count > 0, startLoading, stopLoading }),
    [count, startLoading, stopLoading],
  )

  return (
    <PageLoadingContext.Provider value={value}>
      {children}
    </PageLoadingContext.Provider>
  )
}

export function usePageLoading() {
  const ctx = useContext(PageLoadingContext)
  if (!ctx) {
    return { isPageLoading: false, startLoading: () => {}, stopLoading: () => {} }
  }
  return ctx
}
