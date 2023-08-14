import { Providers } from './providers'

export const metadata = {
  title: 'BILLBOARD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#000000" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
