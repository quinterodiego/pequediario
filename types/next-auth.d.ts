import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      isPremium?: boolean
      isAdmin?: boolean
    }
  }
  
  interface User {
    isPremium?: boolean
    isAdmin?: boolean
  }
}