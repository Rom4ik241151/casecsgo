import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  const { names } = await request.json()
  if (!names || !Array.isArray(names)) {
    return NextResponse.json({ error: 'No names' }, { status: 400 })
  }

  const PRICES: Record<string, number> = {
    'AK-47 | Redline': 1200, 'AK-47 | Neon Rider': 2500, 'AK-47 | Bloodsport': 800,
    'AK-47 | Vulcan': 8000, 'AK-47 | Wild Lotus': 45000, 'AK-47 | Fire Serpent': 35000,
    'AK-47 | Frontside Misty': 600, 'AK-47 | Ice Coaled': 500, 'AK-47 | Slate': 200,
    'AK-47 | Phantom Disruptor': 700, 'AK-47 | The Empress': 1500, 'AK-47 | Neon Revolution': 900,
    'AK-47 | Safari Mesh': 150, 'AK-47 | Gold Arabesque': 35000,
    'AWP | Asiimov': 3500, 'AWP | Neo-Noir': 2800, 'AWP | Dragon Lore': 200000,
    'AWP | Medusa': 25000, 'AWP | Lightning Strike': 12000, 'AWP | Fade': 18000,
    'AWP | Wildfire': 2000, 'AWP | Containment Breach': 400, 'AWP | Mortis': 300,
    'AWP | Acheron': 250, 'AWP | Atheris': 350, 'AWP | Chromatic Aberration': 600,
    'AWP | Safari Mesh': 100, 'AWP | Worm God': 200,
    'Desert Eagle | Blaze': 2000, 'Desert Eagle | Code Red': 1500,
    'Desert Eagle | Kumicho Dragon': 800, 'Desert Eagle | Mecha Industries': 600,
    'Desert Eagle | Golden Koi': 1200, 'Desert Eagle | Emerald Jörmungandr': 6000,
    'USP-S | Kill Confirmed': 1800, 'USP-S | Printstream': 4500,
    'USP-S | Neo-Noir': 800, 'USP-S | Orion': 3000, 'USP-S | Cortex': 400,
    'Glock-18 | Fade': 4000, 'Glock-18 | Water Elemental': 400,
    'Glock-18 | Dragon Tattoo': 1200, 'Glock-18 | Twilight Galaxy': 3500,
    'M4A4 | Howl': 120000, 'M4A4 | Neo-Noir': 1500, 'M4A4 | Dragon King': 600,
    'M4A1-S | Printstream': 6000, 'M4A1-S | Hyper Beast': 1200, 'M4A1-S | Decimator': 800,
    'Karambit | Fade': 55000, 'Karambit | Doppler': 40000, 'Karambit | Tiger Tooth': 35000,
    'Karambit | Marble Fade': 45000, 'Karambit | Slaughter': 30000,
    'Flip Knife | Doppler': 8000, 'Flip Knife | Marble Fade': 7000,
    'Gut Knife | Fade': 5000, 'Gut Knife | Tiger Tooth': 3500,
    'Bayonet | Doppler': 12000, 'M9 Bayonet | Doppler': 18000,
    'MP7 | Bloodsport': 400, 'MAC-10 | Neon Rider': 800, 'P90 | Asiimov': 600,
    'SSG 08 | Blood in the Water': 1200, 'Sport Gloves | Big Game': 15000,
    'Specialist Gloves | Emerald Web': 20000, 'Moto Gloves | Boom!': 8000,
  }

  const prices: Record<string, number | null> = {}
  names.forEach((name: string) => {
    prices[name] = PRICES[name] || null
  })

  return NextResponse.json({ prices })
}