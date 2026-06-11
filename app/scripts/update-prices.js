const fs = require('fs')
const path = require('path')
const https = require('https')

// Предметы для отслеживания
const targetItems = [
  { name: 'AK-47 | Redline', marketHash: 'AK-47 | Redline' },
  { name: 'AK-47 | Neon Rider', marketHash: 'AK-47 | Neon Rider' },
  { name: 'AWP | Asiimov', marketHash: 'AWP | Asiimov' },
  { name: 'AWP | Neo-Noir', marketHash: 'AWP | Neo-Noir' },
  { name: 'Desert Eagle | Blaze', marketHash: 'Desert Eagle | Blaze' },
  { name: 'Desert Eagle | Code Red', marketHash: 'Desert Eagle | Code Red' },
  { name: 'USP-S | Kill Confirmed', marketHash: 'USP-S | Kill Confirmed' },
  { name: 'USP-S | Printstream', marketHash: 'USP-S | Printstream' },
  { name: 'Glock-18 | Fade', marketHash: 'Glock-18 | Fade' },
  { name: 'M4A4 | Neo-Noir', marketHash: 'M4A4 | Neo-Noir' },
  { name: 'M4A1-S | Printstream', marketHash: 'M4A1-S | Printstream' },
  { name: 'MAC-10 | Neon Rider', marketHash: 'MAC-10 | Neon Rider' },
  { name: 'Gut Knife | Forest DDPAT', marketHash: 'Gut Knife | Forest DDPAT' },
  { name: 'Flip Knife | Forest DDPAT', marketHash: 'Flip Knife | Forest DDPAT' }
]

// Функция для получения цены с Steam
function fetchPrice(itemName) {
  return new Promise((resolve) => {
    const url = `https://steamcommunity.com/market/priceoverview/?currency=5&appid=730&market_hash_name=${encodeURIComponent(itemName)}`
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    }
    
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.success && json.lowest_price) {
            const priceMatch = json.lowest_price.match(/[\d\s,]+/)
            if (priceMatch) {
              const price = parseFloat(priceMatch[0].replace(/\s/g, '').replace(',', '.'))
              resolve(Math.round(price))
            } else {
              resolve(null)
            }
          } else {
            resolve(null)
          }
        } catch (e) {
          resolve(null)
        }
      })
    }).on('error', () => resolve(null))
  })
}

// Основная функция
async function updatePrices() {
  console.log('🔄 Обновление цен из Steam...')
  console.log(`📅 ${new Date().toLocaleString()}`)
  console.log('─'.repeat(50))
  
  const prices = {}
  let successCount = 0
  
  for (const item of targetItems) {
    process.stdout.write(`  ${item.name}... `)
    const price = await fetchPrice(item.marketHash)
    
    if (price && price > 0) {
      prices[item.name] = price
      console.log(`✅ ${price} ₽`)
      successCount++
    } else {
      console.log(`❌ не найдена`)
    }
    
    // Задержка чтобы не забанили
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('─'.repeat(50))
  console.log(`✅ Успешно обновлено: ${successCount}/${targetItems.length}`)
  
  // Сохраняем в файл
  const outputPath = path.join(__dirname, '../app/data/prices.json')
  const dirPath = path.dirname(outputPath)
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2))
  console.log(`💾 Сохранено в: app/data/prices.json`)
  console.log('─'.repeat(50))
}

// Запускаем
updatePrices()