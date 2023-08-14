'use client'


export function Connected({ children }: { children: React.ReactNode }) {

  if (!window.ethereum.isConnected()) return null
  return <>{children}</>
}
