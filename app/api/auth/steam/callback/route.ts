import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return handleCallback(req)
}

export async function POST(req: NextRequest) {
  return handleCallback(req)
}

async function handleCallback(req: NextRequest) {
  const url = new URL(req.url)
  const claimedId = url.searchParams.get('openid.claimed_id') || ''
  const steamId = claimedId.split('/').pop()

  if (!steamId || steamId === 'identifier_select') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=no_steam_id`)
  }

  try {
    const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    const res = await fetch(apiUrl)
    const data = await res.json()
    const player = data.response?.players?.[0]

    if (!player) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=steam_failed`)
    }

    const response = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL!)
    response.cookies.set('steam_user', JSON.stringify({
      steamId: player.steamid,
      name: player.personaname,
      avatar: player.avatarfull,
    }), { 
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    })

    return response
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=fetch_failed`)
  }
}