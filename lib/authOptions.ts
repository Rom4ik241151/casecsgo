import { AuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'steam',
      name: 'Steam',
      type: 'oauth',
      authorization: {
        url: 'https://steamcommunity.com/openid/login',
        params: {
          'openid.mode': 'checkid_setup',
          'openid.ns': 'http://specs.openid.net/auth/2.0',
          'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
          'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
          'openid.return_to': process.env.NEXT_PUBLIC_STEAM_RETURN_URL,
          'openid.realm': process.env.NEXT_PUBLIC_APP_URL,
        }
      },
      checks: ['none'],
      idToken: false,
      token: {
        async request(context: any) {
          const claimedId = context.params['openid.claimed_id'] as string
          const steamId = claimedId.split('/').pop()!
          return { tokens: { access_token: steamId } }
        }
      },
      userinfo: {
        async request(context: any) {
          const steamId = context.tokens.access_token
          const apiKey = process.env.STEAM_API_KEY
          const res = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
          )
          const data = await res.json()
          return data.response.players[0]
        }
      },
      profile(profile: any) {
        return {
          id: profile.steamid,
          name: profile.personaname ?? 'Игрок',
          image: profile.avatarfull ?? null,
        }
      },
      clientId: 'steam',
      clientSecret: 'steam',
    }
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const steamId = user.id
        if (!steamId) return true
        await prisma.user.upsert({
          where: { steamId },
          update: {
            username: user.name ?? 'Игрок',
            avatar: user.image ?? null,
            lastSeen: new Date(),
          },
          create: {
            steamId,
            username: user.name ?? 'Игрок',
            avatar: user.image ?? null,
            balance: 1000,
            totalWon: 0,
          }
        })
      } catch (e) {
        console.error('signIn error:', e)
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).steamId = token.sub
        try {
          const dbUser = await prisma.user.findUnique({
            where: { steamId: token.sub! }
          })
          if (dbUser) {
            (session.user as any).id = dbUser.id as unknown as string
            ;(session.user as any).balance = dbUser.balance
          }
        } catch {}
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}