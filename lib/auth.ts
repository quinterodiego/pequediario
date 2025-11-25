import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { GoogleSheetsService } from '@/lib/googleSheets'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const result = await GoogleSheetsService.verifyCredentials(
          credentials.email,
          credentials.password
        )

        if (!result.valid || !result.user) {
          return null
        }

        return {
          id: result.user.email,
          email: result.user.email,
          name: result.user.name || 'Usuario',
          image: result.user.image || undefined,
          isPremium: result.user.isPremium,
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Si es el primer login, guardar información del usuario en el token
      if (user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.isPremium = (user as any).isPremium || false
      }
      
      // Verificar premium status desde Google Sheets si hay email
      if (token.email) {
        try {
          const isPremium = await GoogleSheetsService.checkPremiumStatus(token.email as string)
          token.isPremium = isPremium
        } catch (error) {
          console.error('Error verificando premium:', error)
          token.isPremium = false
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Pasar información del token a la sesión
      if (session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        session.user.isPremium = token.isPremium as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Guardar o actualizar el usuario en Google Sheets solo para Google OAuth
      if (account?.provider === 'google' && user.email) {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await GoogleSheetsService.getUserByEmail(user.email)
          
          if (existingUser.exists) {
            // Usuario existe: actualizar información si cambió
            await GoogleSheetsService.updateUser({
              email: user.email,
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              // No actualizar isPremium aquí, se mantiene el valor existente
            })
          } else {
            // Usuario nuevo: guardarlo
            await GoogleSheetsService.saveUser({
              email: user.email,
              name: user.name || 'Usuario',
              image: user.image || undefined,
              isPremium: false, // Nuevo usuario empieza como gratuito
            })
          }
          
          return true
        } catch (error) {
          console.error('Error guardando/actualizando usuario:', error)
          return true // Permitir acceso aunque falle el guardado
        }
      }
      
      // Para Credentials provider, ya se verificó en authorize
      if (account?.provider === 'credentials') {
        return true
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // Si el usuario viene de un login exitoso, redirigir al dashboard
      if (url === baseUrl || url === `${baseUrl}/` || url.startsWith(`${baseUrl}/api/auth`)) {
        return `${baseUrl}/dashboard`
      }
      // Si hay una URL específica, usarla
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Por defecto, redirigir al dashboard
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}



