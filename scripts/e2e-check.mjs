import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const base = process.env.BASE_URL || 'http://127.0.0.1:4187'
const output = resolve(process.cwd(), 'validation')
await mkdir(output, { recursive: true })

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const consoleErrors = []
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('pageerror', (error) => consoleErrors.push(error.message))

const report = {}
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForSelector('.product-card')
report.home = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.product-card')]
  const images = [...document.querySelectorAll('.product-card__image img')]
  const hero = document.querySelector('.hero')?.getBoundingClientRect()
  const tabbar = document.querySelector('.tabbar')?.getBoundingClientRect()
  const video = document.querySelector('video')
  return {
    viewport: { width: innerWidth, height: innerHeight },
    cards: cards.length,
    imagesLoaded: images.every((image) => image.complete && image.naturalWidth > 0),
    hero: hero ? { width: Math.round(hero.width), height: Math.round(hero.height), top: Math.round(hero.top) } : null,
    heroSlides: document.querySelectorAll('.hero__slide').length,
    video: {
      exists: Boolean(video),
      readyState: video?.readyState ?? 0,
      muted: Boolean(video?.muted),
      autoplay: Boolean(video?.autoplay)
    },
    tabbarVisible: Boolean(tabbar && tabbar.bottom <= innerHeight + 1),
    title: document.title,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1
  }
})
report.homeImages = await page.evaluate(() => [...document.querySelectorAll('.product-card__image img')].map((img) => ({ complete: img.complete, width: img.naturalWidth })))

await page.locator('.hero__sound').click()
await page.waitForTimeout(300)
report.videoSound = await page.evaluate(() => ({
  muted: document.querySelector('video')?.muted,
  label: document.querySelector('.hero__sound')?.textContent?.trim()
}))
await page.locator('.hero__sound').click()
await page.waitForTimeout(200)

await page.locator('.icon-button').first().click()
await page.locator('.search-panel__input input').fill('包')
await page.waitForTimeout(250)
report.search = await page.evaluate(() => ({
  cards: document.querySelectorAll('.product-card').length,
  hint: document.querySelector('.search-hint')?.textContent?.trim()
}))
await page.getByText('取消', { exact: true }).click()

await page.getByText('外套', { exact: true }).click()
await page.waitForTimeout(250)
report.category = await page.evaluate(() => ({
  cards: document.querySelectorAll('.product-card').length,
  caption: document.querySelector('.curated__caption')?.textContent?.trim()
}))
await page.getByText('全部', { exact: true }).click()
await page.waitForTimeout(200)

await page.screenshot({ path: resolve(output, 'home-mobile.png'), fullPage: true })

await page.locator('.product-card').first().click()
await page.waitForURL(/pages\/detail\/detail/)
await page.waitForSelector('.product-title')
await page.waitForSelector('.size-option')
report.detail = await page.evaluate(() => ({
  name: document.querySelector('.product-title')?.textContent?.trim(),
  price: document.querySelector('.price-main__value')?.textContent?.trim(),
  sizes: [...document.querySelectorAll('.size-option')].map((node) => node.textContent?.trim()),
  colors: [...document.querySelectorAll('.color-option')].map((node) => node.textContent?.trim()),
  activeSize: document.querySelector('.size-option--active')?.textContent?.trim(),
  stockText: document.querySelector('.stock-line')?.textContent?.trim(),
  imagesLoaded: [...document.querySelectorAll('.gallery__image img')].every((image) => image.complete && image.naturalWidth > 0)
}))
await page.screenshot({ path: resolve(output, 'detail-mobile.png'), fullPage: true })

const readCart = () => page.evaluate(() => { const raw = JSON.parse(localStorage.getItem('mori_cart_v1') || '{"data":[]}'); return raw.data || [] })
const beforeCart = await readCart()
await page.getByText('加入购物袋', { exact: true }).click()
await page.waitForTimeout(450)
const afterCart = await readCart()
const added = afterCart.find((item) => item.productId === 'P01' && item.size === 'S')
report.addToCart = { beforeCount: beforeCart.length, afterCount: afterCart.length, delta: afterCart.length - beforeCart.length, addedQuantity: added?.quantity || 0 }

await page.getByText('立即购买', { exact: true }).click()
await page.waitForSelector('.sheet')
report.purchaseSheet = await page.evaluate(() => ({
  visible: Boolean(document.querySelector('.sheet')),
  selectedVariant: document.querySelector('.sheet__variant')?.textContent?.trim(),
  total: document.querySelector('.sheet__total-price')?.textContent?.trim()
}))
await page.screenshot({ path: resolve(output, 'purchase-sheet-mobile.png'), fullPage: false })
await page.locator('.sheet__close').click()

await page.goto(`${base}/#/pages/cart/cart`, { waitUntil: 'networkidle' })
await page.waitForSelector('.cart-item')
report.cart = await page.evaluate(() => ({
  items: document.querySelectorAll('.cart-item').length,
  checkoutVisible: Boolean(document.querySelector('.cart-bar__checkout')),
  total: document.querySelector('.cart-bar__price')?.textContent?.trim(),
  tabbarActive: document.querySelector('.tabbar__item--active')?.textContent?.trim(),
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1
}))
await page.screenshot({ path: resolve(output, 'cart-mobile.png'), fullPage: true })

await page.goto(`${base}/#/pages/profile/profile`, { waitUntil: 'networkidle' })
await page.waitForSelector('.profile-user__name')
report.profile = await page.evaluate(() => ({
  user: document.querySelector('.profile-user__name')?.textContent?.trim(),
  orders: document.querySelectorAll('.recent-order').length,
  address: document.querySelector('.address-card__detail')?.textContent?.trim(),
  menuItems: document.querySelectorAll('.menu-item').length,
  tabbarActive: document.querySelector('.tabbar__item--active')?.textContent?.trim(),
  horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1
}))
await page.locator('.address-card').click()
await page.waitForSelector('.sheet')
report.addressSheet = await page.evaluate(() => ({
  visible: Boolean(document.querySelector('.sheet')),
  fields: document.querySelectorAll('.form-input').length,
  textarea: Boolean(document.querySelector('.form-textarea'))
}))
await page.screenshot({ path: resolve(output, 'profile-mobile.png'), fullPage: true })

report.consoleErrors = consoleErrors
console.log(JSON.stringify(report, null, 2))
await browser.close()