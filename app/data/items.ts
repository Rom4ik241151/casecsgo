// app/data/items.ts

export interface CSItem {
  id: number
  name: string
  market_hash_name: string
  rarity: string
  icon_url: string
}

// Все предметы CS до 2000 руб (актуальные цены будут подгружаться из Steam)
export const csItems: CSItem[] = [
  // === ПИСТОЛЕТЫ ===
  { id: 1, name: 'Desert Eagle | Blaze', market_hash_name: 'Desert Eagle | Blaze', rarity: 'Засекреченное', icon_url: '' },
  { id: 2, name: 'Desert Eagle | Code Red', market_hash_name: 'Desert Eagle | Code Red', rarity: 'Запрещённое', icon_url: '' },
  { id: 3, name: 'Desert Eagle | Kumicho Dragon', market_hash_name: 'Desert Eagle | Kumicho Dragon', rarity: 'Запрещённое', icon_url: '' },
  { id: 4, name: 'Desert Eagle | Mecha Industries', market_hash_name: 'Desert Eagle | Mecha Industries', rarity: 'Засекреченное', icon_url: '' },
  { id: 5, name: 'USP-S | Kill Confirmed', market_hash_name: 'USP-S | Kill Confirmed', rarity: 'Тайное', icon_url: '' },
  { id: 6, name: 'USP-S | Printstream', market_hash_name: 'USP-S | Printstream', rarity: 'Тайное', icon_url: '' },
  { id: 7, name: 'USP-S | Neo-Noir', market_hash_name: 'USP-S | Neo-Noir', rarity: 'Засекреченное', icon_url: '' },
  { id: 8, name: 'USP-S | Cortex', market_hash_name: 'USP-S | Cortex', rarity: 'Запрещённое', icon_url: '' },
  { id: 9, name: 'Glock-18 | Fade', market_hash_name: 'Glock-18 | Fade', rarity: 'Засекреченное', icon_url: '' },
  { id: 10, name: 'Glock-18 | Water Elemental', market_hash_name: 'Glock-18 | Water Elemental', rarity: 'Запрещённое', icon_url: '' },
  { id: 11, name: 'Glock-18 | Dragon Tattoo', market_hash_name: 'Glock-18 | Dragon Tattoo', rarity: 'Запрещённое', icon_url: '' },
  { id: 12, name: 'Glock-18 | Twilight Galaxy', market_hash_name: 'Glock-18 | Twilight Galaxy', rarity: 'Тайное', icon_url: '' },
  { id: 13, name: 'P250 | Asiimov', market_hash_name: 'P250 | Asiimov', rarity: 'Запрещённое', icon_url: '' },
  { id: 14, name: 'P250 | Visions', market_hash_name: 'P250 | Visions', rarity: 'Засекреченное', icon_url: '' },
  { id: 15, name: 'Five-SeveN | Case Hardened', market_hash_name: 'Five-SeveN | Case Hardened', rarity: 'Запрещённое', icon_url: '' },
  { id: 16, name: 'Five-SeveN | Fairy Tale', market_hash_name: 'Five-SeveN | Fairy Tale', rarity: 'Засекреченное', icon_url: '' },
  { id: 17, name: 'CZ75-Auto | Emerald', market_hash_name: 'CZ75-Auto | Emerald', rarity: 'Промышленное', icon_url: '' },
  { id: 18, name: 'CZ75-Auto | Red Astor', market_hash_name: 'CZ75-Auto | Red Astor', rarity: 'Запрещённое', icon_url: '' },
  { id: 19, name: 'Tec-9 | Fuel Injector', market_hash_name: 'Tec-9 | Fuel Injector', rarity: 'Запрещённое', icon_url: '' },
  { id: 20, name: 'Tec-9 | Ice Cap', market_hash_name: 'Tec-9 | Ice Cap', rarity: 'Промышленное', icon_url: '' },
  
  // === ВИНТОВКИ ===
  { id: 21, name: 'AK-47 | Redline', market_hash_name: 'AK-47 | Redline', rarity: 'Засекреченное', icon_url: '' },
  { id: 22, name: 'AK-47 | Neon Rider', market_hash_name: 'AK-47 | Neon Rider', rarity: 'Засекреченное', icon_url: '' },
  { id: 23, name: 'AK-47 | Bloodsport', market_hash_name: 'AK-47 | Bloodsport', rarity: 'Засекреченное', icon_url: '' },
  { id: 24, name: 'AK-47 | Frontside Misty', market_hash_name: 'AK-47 | Frontside Misty', rarity: 'Засекреченное', icon_url: '' },
  { id: 25, name: 'AK-47 | Ice Coaled', market_hash_name: 'AK-47 | Ice Coaled', rarity: 'Засекреченное', icon_url: '' },
  { id: 26, name: 'AK-47 | Slate', market_hash_name: 'AK-47 | Slate', rarity: 'Промышленное', icon_url: '' },
  { id: 27, name: 'AK-47 | Phantom Disruptor', market_hash_name: 'AK-47 | Phantom Disruptor', rarity: 'Засекреченное', icon_url: '' },
  { id: 28, name: 'M4A4 | Neo-Noir', market_hash_name: 'M4A4 | Neo-Noir', rarity: 'Засекреченное', icon_url: '' },
  { id: 29, name: 'M4A4 | Dragon King', market_hash_name: 'M4A4 | Dragon King', rarity: 'Запрещённое', icon_url: '' },
  { id: 30, name: 'M4A4 | Hellfire', market_hash_name: 'M4A4 | Hellfire', rarity: 'Засекреченное', icon_url: '' },
  { id: 31, name: 'M4A4 | Buzz Kill', market_hash_name: 'M4A4 | Buzz Kill', rarity: 'Засекреченное', icon_url: '' },
  { id: 32, name: 'M4A1-S | Printstream', market_hash_name: 'M4A1-S | Printstream', rarity: 'Тайное', icon_url: '' },
  { id: 33, name: 'M4A1-S | Decimator', market_hash_name: 'M4A1-S | Decimator', rarity: 'Засекреченное', icon_url: '' },
  { id: 34, name: 'M4A1-S | Hyper Beast', market_hash_name: 'M4A1-S | Hyper Beast', rarity: 'Засекреченное', icon_url: '' },
  { id: 35, name: 'M4A1-S | Golden Coil', market_hash_name: 'M4A1-S | Golden Coil', rarity: 'Засекреченное', icon_url: '' },
  { id: 36, name: 'M4A1-S | Player Two', market_hash_name: 'M4A1-S | Player Two', rarity: 'Засекреченное', icon_url: '' },
  { id: 37, name: 'M4A1-S | Moss Quartz', market_hash_name: 'M4A1-S | Moss Quartz', rarity: 'Промышленное', icon_url: '' },
  
  // === AWP ===
  { id: 38, name: 'AWP | Asiimov', market_hash_name: 'AWP | Asiimov', rarity: 'Засекреченное', icon_url: '' },
  { id: 39, name: 'AWP | Neo-Noir', market_hash_name: 'AWP | Neo-Noir', rarity: 'Засекреченное', icon_url: '' },
  { id: 40, name: 'AWP | Wildfire', market_hash_name: 'AWP | Wildfire', rarity: 'Засекреченное', icon_url: '' },
  { id: 41, name: 'AWP | Chromatic Aberration', market_hash_name: 'AWP | Chromatic Aberration', rarity: 'Засекреченное', icon_url: '' },
  { id: 42, name: 'AWP | Containment Breach', market_hash_name: 'AWP | Containment Breach', rarity: 'Засекреченное', icon_url: '' },
  { id: 43, name: 'AWP | Mortis', market_hash_name: 'AWP | Mortis', rarity: 'Запрещённое', icon_url: '' },
  { id: 44, name: 'AWP | Acheron', market_hash_name: 'AWP | Acheron', rarity: 'Запрещённое', icon_url: '' },
  { id: 45, name: 'AWP | Atheris', market_hash_name: 'AWP | Atheris', rarity: 'Запрещённое', icon_url: '' },
  
  // === НОЖИ (дешёвые версии до 2000 руб) ===
  { id: 46, name: 'Gut Knife | Forest DDPAT', market_hash_name: 'Gut Knife | Forest DDPAT', rarity: 'Тайное', icon_url: '' },
  { id: 47, name: 'Gut Knife | Safari Mesh', market_hash_name: 'Gut Knife | Safari Mesh', rarity: 'Тайное', icon_url: '' },
  { id: 48, name: 'Gut Knife | Boreal Forest', market_hash_name: 'Gut Knife | Boreal Forest', rarity: 'Тайное', icon_url: '' },
  { id: 49, name: 'Gut Knife | Urban Masked', market_hash_name: 'Gut Knife | Urban Masked', rarity: 'Тайное', icon_url: '' },
  { id: 50, name: 'Gut Knife | Scorched', market_hash_name: 'Gut Knife | Scorched', rarity: 'Тайное', icon_url: '' },
  { id: 51, name: 'Flip Knife | Forest DDPAT', market_hash_name: 'Flip Knife | Forest DDPAT', rarity: 'Тайное', icon_url: '' },
  { id: 52, name: 'Flip Knife | Safari Mesh', market_hash_name: 'Flip Knife | Safari Mesh', rarity: 'Тайное', icon_url: '' },
  { id: 53, name: 'Flip Knife | Boreal Forest', market_hash_name: 'Flip Knife | Boreal Forest', rarity: 'Тайное', icon_url: '' },
  { id: 54, name: 'Shadow Daggers | Forest DDPAT', market_hash_name: 'Shadow Daggers | Forest DDPAT', rarity: 'Тайное', icon_url: '' },
  { id: 55, name: 'Shadow Daggers | Safari Mesh', market_hash_name: 'Shadow Daggers | Safari Mesh', rarity: 'Тайное', icon_url: '' },
  { id: 56, name: 'Navaja Knife | Forest DDPAT', market_hash_name: 'Navaja Knife | Forest DDPAT', rarity: 'Тайное', icon_url: '' },
  { id: 57, name: 'Navaja Knife | Safari Mesh', market_hash_name: 'Navaja Knife | Safari Mesh', rarity: 'Тайное', icon_url: '' },
  
  // === ПП, ДРОБОВИКИ, ПУЛЕМЁТЫ ===
  { id: 58, name: 'MAC-10 | Neon Rider', market_hash_name: 'MAC-10 | Neon Rider', rarity: 'Запрещённое', icon_url: '' },
  { id: 59, name: 'MAC-10 | Whitefish', market_hash_name: 'MAC-10 | Whitefish', rarity: 'Промышленное', icon_url: '' },
  { id: 60, name: 'MP9 | Bulldozer', market_hash_name: 'MP9 | Bulldozer', rarity: 'Промышленное', icon_url: '' },
  { id: 61, name: 'MP9 | Rose Iron', market_hash_name: 'MP9 | Rose Iron', rarity: 'Промышленное', icon_url: '' },
  { id: 62, name: 'MP7 | Bloodsport', market_hash_name: 'MP7 | Bloodsport', rarity: 'Запрещённое', icon_url: '' },
  { id: 63, name: 'MP7 | Nemesis', market_hash_name: 'MP7 | Nemesis', rarity: 'Запрещённое', icon_url: '' },
  { id: 64, name: 'P90 | Asiimov', market_hash_name: 'P90 | Asiimov', rarity: 'Запрещённое', icon_url: '' },
  { id: 65, name: 'P90 | Emerald Dragon', market_hash_name: 'P90 | Emerald Dragon', rarity: 'Засекреченное', icon_url: '' },
  { id: 66, name: 'UMP-45 | Crime Scene', market_hash_name: 'UMP-45 | Crime Scene', rarity: 'Запрещённое', icon_url: '' },
  { id: 67, name: 'UMP-45 | Arctica', market_hash_name: 'UMP-45 | Arctica', rarity: 'Промышленное', icon_url: '' },
  { id: 68, name: 'PP-Bizon | Judgement of Anubis', market_hash_name: 'PP-Bizon | Judgement of Anubis', rarity: 'Засекреченное', icon_url: '' },
  { id: 69, name: 'PP-Bizon | Embargo', market_hash_name: 'PP-Bizon | Embargo', rarity: 'Запрещённое', icon_url: '' },
  { id: 70, name: 'SSG 08 | Blood in the Water', market_hash_name: 'SSG 08 | Blood in the Water', rarity: 'Засекреченное', icon_url: '' },
  { id: 71, name: 'SSG 08 | Death Strike', market_hash_name: 'SSG 08 | Death Strike', rarity: 'Запрещённое', icon_url: '' },
  { id: 72, name: 'SSG 08 | Turbo Peek', market_hash_name: 'SSG 08 | Turbo Peek', rarity: 'Запрещённое', icon_url: '' },
  { id: 73, name: 'SCAR-20 | Emerald', market_hash_name: 'SCAR-20 | Emerald', rarity: 'Промышленное', icon_url: '' },
  { id: 74, name: 'SCAR-20 | Magna Carta', market_hash_name: 'SCAR-20 | Magna Carta', rarity: 'Засекреченное', icon_url: '' },
  { id: 75, name: 'FAMAS | Roll Cage', market_hash_name: 'FAMAS | Roll Cage', rarity: 'Запрещённое', icon_url: '' },
  { id: 76, name: 'FAMAS | Meow 36', market_hash_name: 'FAMAS | Meow 36', rarity: 'Промышленное', icon_url: '' },
  { id: 77, name: 'Galil AR | Chatterbox', market_hash_name: 'Galil AR | Chatterbox', rarity: 'Запрещённое', icon_url: '' },
  { id: 78, name: 'Galil AR | Sugar Rush', market_hash_name: 'Galil AR | Sugar Rush', rarity: 'Запрещённое', icon_url: '' },
  { id: 79, name: 'SG 553 | Aerial', market_hash_name: 'SG 553 | Aerial', rarity: 'Запрещённое', icon_url: '' },
  { id: 80, name: 'SG 553 | Hazard Pay', market_hash_name: 'SG 553 | Hazard Pay', rarity: 'Запрещённое', icon_url: '' },
  { id: 81, name: 'AUG | Chameleon', market_hash_name: 'AUG | Chameleon', rarity: 'Промышленное', icon_url: '' },
  { id: 82, name: 'AUG | Aristocrat', market_hash_name: 'AUG | Aristocrat', rarity: 'Запрещённое', icon_url: '' },
  { id: 83, name: 'AUG | Flame Jab', market_hash_name: 'AUG | Flame Jab', rarity: 'Запрещённое', icon_url: '' },
  { id: 84, name: 'MAG-7 | Heat', market_hash_name: 'MAG-7 | Heat', rarity: 'Промышленное', icon_url: '' },
  { id: 85, name: 'MAG-7 | Copper Coated', market_hash_name: 'MAG-7 | Copper Coated', rarity: 'Промышленное', icon_url: '' },
  { id: 86, name: 'Nova | Hyper Beast', market_hash_name: 'Nova | Hyper Beast', rarity: 'Запрещённое', icon_url: '' },
  { id: 87, name: 'Nova | Woodland', market_hash_name: 'Nova | Woodland', rarity: 'Ширпотреб', icon_url: '' },
  { id: 88, name: 'XM1014 | Frostbourne', market_hash_name: 'XM1014 | Frostbourne', rarity: 'Запрещённое', icon_url: '' },
  { id: 89, name: 'XM1014 | Seasons', market_hash_name: 'XM1014 | Seasons', rarity: 'Промышленное', icon_url: '' },
  
  // === ПЕРЧАТКИ (дешёвые) ===
  { id: 90, name: 'Broken Fang Gloves | Needle Point', market_hash_name: 'Broken Fang Gloves | Needle Point', rarity: 'Тайное', icon_url: '' },
  { id: 91, name: 'Broken Fang Gloves | Unhinged', market_hash_name: 'Broken Fang Gloves | Unhinged', rarity: 'Тайное', icon_url: '' },
  { id: 92, name: 'Driver Gloves | Lunar Weave', market_hash_name: 'Driver Gloves | Lunar Weave', rarity: 'Тайное', icon_url: '' },
  { id: 93, name: 'Driver Gloves | Rezan the Red', market_hash_name: 'Driver Gloves | Rezan the Red', rarity: 'Тайное', icon_url: '' },
  { id: 94, name: 'Hand Wraps | Cobalt Skulls', market_hash_name: 'Hand Wraps | Cobalt Skulls', rarity: 'Тайное', icon_url: '' },
  { id: 95, name: 'Hand Wraps | Duct Tape', market_hash_name: 'Hand Wraps | Duct Tape', rarity: 'Тайное', icon_url: '' },
  { id: 96, name: 'Moto Gloves | Boom!', market_hash_name: 'Moto Gloves | Boom!', rarity: 'Тайное', icon_url: '' },
  { id: 97, name: 'Moto Gloves | Smoke Out', market_hash_name: 'Moto Gloves | Smoke Out', rarity: 'Тайное', icon_url: '' },
  { id: 98, name: 'Specialist Gloves | Emerald Web', market_hash_name: 'Specialist Gloves | Emerald Web', rarity: 'Тайное', icon_url: '' },
  { id: 99, name: 'Specialist Gloves | Mogul', market_hash_name: 'Specialist Gloves | Mogul', rarity: 'Тайное', icon_url: '' },
  { id: 100, name: 'Sport Gloves | Big Game', market_hash_name: 'Sport Gloves | Big Game', rarity: 'Тайное', icon_url: '' },
]