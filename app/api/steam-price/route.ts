import { NextRequest, NextResponse } from 'next/server'

const PRICES: Record<string, number> = {
  // AK-47
  'AK-47 | Redline': 1200, 'AK-47 | Neon Rider': 2500, 'AK-47 | Bloodsport': 800,
  'AK-47 | Vulcan': 8000, 'AK-47 | Wild Lotus': 45000, 'AK-47 | Fire Serpent': 35000,
  'AK-47 | Frontside Misty': 600, 'AK-47 | Ice Coaled': 500, 'AK-47 | Slate': 200,
  'AK-47 | Phantom Disruptor': 700, 'AK-47 | The Empress': 1500, 'AK-47 | Neon Revolution': 900,
  'AK-47 | Safari Mesh': 150, 'AK-47 | Gold Arabesque': 35000,
  // AWP
  'AWP | Asiimov': 3500, 'AWP | Neo-Noir': 2800, 'AWP | Dragon Lore': 200000,
  'AWP | Medusa': 25000, 'AWP | Lightning Strike': 12000, 'AWP | Fade': 18000,
  'AWP | Wildfire': 2000, 'AWP | Containment Breach': 400, 'AWP | Mortis': 300,
  'AWP | Acheron': 250, 'AWP | Atheris': 350, 'AWP | Chromatic Aberration': 600,
  'AWP | Safari Mesh': 100, 'AWP | Worm God': 200,
  // Desert Eagle
  'Desert Eagle | Blaze': 2000, 'Desert Eagle | Code Red': 1500,
  'Desert Eagle | Kumicho Dragon': 800, 'Desert Eagle | Mecha Industries': 600,
  'Desert Eagle | Golden Koi': 1200, 'Desert Eagle | Emerald Jörmungandr': 6000,
  // USP-S
  'USP-S | Kill Confirmed': 1800, 'USP-S | Printstream': 4500,
  'USP-S | Neo-Noir': 800, 'USP-S | Orion': 3000, 'USP-S | Cortex': 400,
  'USP-S | Pathfinder': 200,
  // Glock
  'Glock-18 | Fade': 4000, 'Glock-18 | Water Elemental': 400,
  'Glock-18 | Dragon Tattoo': 1200, 'Glock-18 | Twilight Galaxy': 3500,
  'Glock-18 | Steel Disruption': 50, 'Glock-18 | Isaac': 300,
  // M4
  'M4A4 | Howl': 120000, 'M4A4 | Neo-Noir': 1500, 'M4A4 | Dragon King': 600,
  'M4A4 | Hellfire': 700, 'M4A4 | Buzz Kill': 500, 'M4A4 | Desert Storm': 100,
  'M4A1-S | Printstream': 6000, 'M4A1-S | Hyper Beast': 1200, 'M4A1-S | Decimator': 800,
  'M4A1-S | Golden Coil': 700, 'M4A1-S | Master Piece': 1800, 'M4A1-S | Player Two': 900,
  'M4A1-S | Moss Quartz': 150, 'M4A1-S | Bright Water': 200,
  // Ножи
  'Karambit | Fade': 55000, 'Karambit | Doppler': 40000, 'Karambit | Tiger Tooth': 35000,
  'Karambit | Marble Fade': 45000, 'Karambit | Slaughter': 30000, 'Karambit | Case Hardened': 60000,
  'Karambit | Forest DDPAT': 20000, 'Karambit | Safari Mesh': 18000,
  'Flip Knife | Doppler': 8000, 'Flip Knife | Marble Fade': 7000, 'Flip Knife | Tiger Tooth': 6000,
  'Flip Knife | Forest DDPAT': 4000, 'Flip Knife | Safari Mesh': 3500, 'Flip Knife | Boreal Forest': 3000,
  'Gut Knife | Fade': 5000, 'Gut Knife | Tiger Tooth': 3500, 'Gut Knife | Forest DDPAT': 2500,
  'Gut Knife | Safari Mesh': 2000, 'Gut Knife | Boreal Forest': 1800, 'Gut Knife | Urban Masked': 1600,
  'Gut Knife | Scorched': 1500,
  'Bayonet | Doppler': 12000, 'Bayonet | Tiger Tooth': 9000, 'Bayonet | Marble Fade': 11000,
  'Bayonet | Forest DDPAT': 5000, 'Bayonet | Tiger Tooth': 9000,
  'M9 Bayonet | Doppler': 18000, 'M9 Bayonet | Tiger Tooth': 14000, 'M9 Bayonet | Slaughter': 12000,
  'Shadow Daggers | Forest DDPAT': 2000, 'Shadow Daggers | Safari Mesh': 1800,
  'Navaja Knife | Forest DDPAT': 2000, 'Navaja Knife | Safari Mesh': 1800,
  // P250
  'P250 | Asiimov': 300, 'P250 | Sand Dune': 50, 'P250 | Visions': 400, 'P250 | Gunsmoke': 350,
  // Five-SeveN
  'Five-SeveN | Case Hardened': 400, 'Five-SeveN | Fairy Tale': 600,
  'Five-SeveN | Forest Night': 80, 'Five-SeveN | Flame Test': 300,
  // CZ75
  'CZ75-Auto | Victoria': 500, 'CZ75-Auto | Red Astor': 300, 'CZ75-Auto | Army Mesh': 80,
  'CZ75-Auto | Emerald': 150,
  // Tec-9
  'Tec-9 | Fuel Injector': 400, 'Tec-9 | Avalanche': 300, 'Tec-9 | Isaac': 200,
  'Tec-9 | Tornado': 80, 'Tec-9 | Ice Cap': 100,
  // Dual Berettas
  'Dual Berettas | Contractor': 150, 'P2000 | Oceanic': 200,
  // ПП
  'MP7 | Bloodsport': 400, 'MP7 | Nemesis': 350,
  'MP9 | Bulldozer': 150, 'MP9 | Rose Iron': 120, 'MP9 | Sand Scale': 80,
  'MAC-10 | Neon Rider': 800, 'MAC-10 | Whitefish': 100, 'MAC-10 | Indigo': 80,
  'P90 | Asiimov': 600, 'P90 | Emerald Dragon': 500, 'P90 | Scorched': 80,
  'UMP-45 | Crime Scene': 300, 'UMP-45 | Arctica': 150, 'UMP-45 | Bone Pile': 80,
  'PP-Bizon | Judgement of Anubis': 500, 'PP-Bizon | Embargo': 300,
  'MP5-SD | Phosphor': 200,
  // Винтовки
  'SSG 08 | Blood in the Water': 1200, 'SSG 08 | Death Strike': 300, 'SSG 08 | Turbo Peek': 250,
  'SCAR-20 | Emerald': 150, 'SCAR-20 | Magna Carta': 400,
  'FAMAS | Roll Cage': 300, 'FAMAS | Meltdown': 200, 'FAMAS | Meow 36': 100,
  'Galil AR | Chatterbox': 300, 'Galil AR | Sugar Rush': 250, 'Galil AR | Eco': 100,
  'SG 553 | Aerial': 250, 'SG 553 | Hazard Pay': 200, 'SG 553 | Cyrex': 300,
  'AUG | Chameleon': 150, 'AUG | Aristocrat': 300, 'AUG | Flame Jab': 250,
  // Дробовики
  'MAG-7 | Heat': 150, 'MAG-7 | Copper Coated': 100,
  'Nova | Hyper Beast': 400, 'Nova | Woodland': 50,
  'XM1014 | Frostbourne': 300, 'XM1014 | Seasons': 150,
  // Перчатки
  'Sport Gloves | Big Game': 15000, 'Specialist Gloves | Emerald Web': 20000,
  'Moto Gloves | Boom!': 8000, 'Hand Wraps | Cobalt Skulls': 12000,
  'Driver Gloves | Lunar Weave': 6000, 'Broken Fang Gloves | Needle Point': 5000,
  'Broken Fang Gloves | Unhinged': 4500, 'Driver Gloves | Rezan the Red': 5500,
  'Hand Wraps | Duct Tape': 4000, 'Moto Gloves | Smoke Out': 3500,
  'Specialist Gloves | Mogul': 4000,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  if (!name) return NextResponse.json({ price: null })
  return NextResponse.json({ price: PRICES[name] || null })
}