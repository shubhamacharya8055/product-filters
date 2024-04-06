import { type Product, db } from '.'
import * as dotenv from 'dotenv'

dotenv.config()

const getRandomPrice = () => {
  const PRICES = [149.00,189.00,249.00,299.00,369.00,499.00,699.00,799.00,999.00]
  return PRICES[Math.floor(Math.random() * PRICES.length)]
}

const COLORS = ['white', 'beige', 'blue', 'green', 'purple'] as const
const SIZES = ['S', 'M', 'L'] as const

const seed = async () => {
  const products: Product[] = []

  // 3 example products
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < COLORS.length; j++) {
      for (let k = 0; k < SIZES.length; k++) {
        const size = SIZES[k]
        const color = COLORS[j]
        products.push({
          id: `${color}-${size}-${i + 1}`,
          imageId: `/${color}_${i + 1}.png`,
          color,
          name: `${
            color.slice(0, 1).toUpperCase() + color.slice(1)
          } shirt ${i}`,
          size,
          price: getRandomPrice(),
        })
      }
    }
  }

  const SIZE_MAP = {
    S: 0,
    M: 1,
    L: 2,
  }

  const COLOR_MAP = {
    white: 0,
    beige: 1,
    blue: 2,
    green: 3,
    purple: 4,
  }

  await db.upsert(
    products.map((product) => ({
      id: product.id,
      vector: [COLOR_MAP[product.color], SIZE_MAP[product.size], product.price],
      metadata: product,
    }))
  )
}

seed()
