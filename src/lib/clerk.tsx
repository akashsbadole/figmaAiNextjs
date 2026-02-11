import { ClerkProvider } from '@clerk/nextjs'

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'shadow-xl',
          navbar: 'hidden',
          footer: 'hidden',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
