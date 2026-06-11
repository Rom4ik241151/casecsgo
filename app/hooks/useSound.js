import { useCallback, useRef } from 'react'

export const useSound = (soundPath, volume = 0.5) => {
  const audioRef = useRef(null)

  const play = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(soundPath)
        audioRef.current.volume = volume
      }
      
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.log('Play error:', e))
    } catch (error) {
      console.log('Sound error:', error)
    }
  }, [soundPath, volume])

  return { play }
}