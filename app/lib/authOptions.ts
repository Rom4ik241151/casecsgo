import { AuthOptions } from 'next-auth'

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
      token: 'https://steamcommunity.com/openid/login',
      userinfo: 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
      profile(profile: any) {
        return {
          id: profile.steamid,
          name: profile.personaname,
          image: profile.avatarfull,
        }
      },
      clientId: 'steam',
      clientSecret: process.env.STEAM_API_KEY!,
    }
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).steamId = token.sub
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}