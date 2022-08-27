import express from 'express'
import type { Browser } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker'
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { captureHeapSnapshot, findObjectsWithProperties } from 'puppeteer-heap-snapshot'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

let browser: Browser

puppeteer.use(AdBlockerPlugin())
puppeteer.use(RecaptchaPlugin())
puppeteer.use(StealthPlugin())

app.post('/', async (request, response) => {
  const { url, objects } = request.body

  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      userDataDir: '/tmp',
      executablePath: process.env.CHROME_PATH,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ],
    })
  }

  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForFunction(() => document.readyState === 'complete')
  const heapSnapshot = await captureHeapSnapshot(page.target())
  const client = await page.target().createCDPSession()
  await client.send('Network.clearBrowserCookies')
  await page.close()

  response.json(findObjectsWithProperties(heapSnapshot, objects))
})

app.listen(process.env.PORT, () => {
  process.on('SIGINT', async () => {
    process.exit()
  })
})
