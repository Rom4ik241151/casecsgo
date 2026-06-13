'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useStore } from '../store'

export default function AuthProvider() {
  const { data: session } = useSession()
  const { setSteamUser } = useStore()

  useEffect(() => {
    if (session?.user) {
      const steamId = (session.user as any).steamId
      const balance = (session.user as any).balance ?? 0
      
      setSteamUser({ 
  steamId,
  avatar: (session.user as any).image || session.user?.image || null,
  username: session.user?.name || 'Игрок'
})
      useStore.setState({ balance })
    }
  }, [session])

  return null
}