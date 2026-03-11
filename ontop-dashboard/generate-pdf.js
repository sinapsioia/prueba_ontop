/**
 * generate-pdf.js
 *
 * Generates a static PDF of all 5 dashboard slides.
 * Each slide becomes one landscape page at 1440×900 CSS px (2× hi-res capture).
 *
 * Usage:
 *   1. npm run build          (if you haven't built yet)
 *   2. npm run pdf
 *
 * Output: ontop-cs-report-2024.pdf  (in this folder)
 */

import puppeteer  from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import http       from 'http'
import fs         from 'fs'
import path       from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────
const DIST_DIR  = path.join(__dirname, 'dist')
const OUT_FILE  = path.join(__dirname, 'ontop-cs-report-2024.pdf')
const PORT      = 5055
const SLIDES    = 5
const VP_W      = 1440   // CSS viewport width  (px)
const VP_H      = 900    // CSS viewport height (px)
const SCALE     = 2      // deviceScaleFactor → 2880 × 1800 actual PNG

// MIME types for static file serving
const MIME_MAP = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript',
  '.css':   'text/css',
  '.png':   'image/png',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.json':  'application/json',
  '.webp':  'image/webp',
}

// ── Static server ─────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Strip query strings and decode URI
      const urlPath  = decodeURIComponent(req.url.split('?')[0])
      let   filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath)

      // SPA fallback: serve index.html for any unknown path
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html')
      }

      const ext         = path.extname(filePath).toLowerCase()
      const contentType = MIME_MAP[ext] ?? 'application/octet-stream'

      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return }
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(data)
      })
    })

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`  Server ready → http://localhost:${PORT}`)
      resolve(server)
    })
    server.on('error', reject)
  })
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('\n📄  Ontop CS Dashboard — PDF Generator')
  console.log('─'.repeat(44))

  // Guard: dist must exist
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('\n✗  dist/ not found. Run "npm run build" first.\n')
    process.exit(1)
  }

  // 1. Start static server
  process.stdout.write('  Starting server ...')
  const server = await startServer()
  console.log(' done')

  let browser
  try {
    // 2. Launch headless Chrome
    process.stdout.write('  Launching browser ...')
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',        // allow local font loads
        '--force-color-profile=srgb',
        '--font-render-hinting=none',    // crisper font rendering
      ],
    })
    console.log(' done')

    const page = await browser.newPage()

    // Set viewport — high-DPI capture
    await page.setViewport({ width: VP_W, height: VP_H, deviceScaleFactor: SCALE })

    // Disable ALL animations before the page loads:
    //   1. Our CSS already has: @media (prefers-reduced-motion: reduce) { * { animation: none } }
    //   2. Recharts 3 checks this media query and skips chart entry animations
    // Without this, charts are captured mid-animation and appear empty.
    await page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' },
    ])

    // 3. Load the app
    process.stdout.write('  Loading app ...')
    await page.goto(`http://localhost:${PORT}`, {
      waitUntil: 'networkidle0',
      timeout:   30_000,
    })

    // Wait for fonts (Google Fonts CDN) and initial render to complete
    await new Promise(r => setTimeout(r, 2500))
    console.log(' done')

    // 4. Screenshot each slide
    console.log()
    const screenshots = []

    for (let i = 0; i < SLIDES; i++) {
      process.stdout.write(`  Slide ${i + 1}/${SLIDES}  capturing ...`)

      // Short settle after slide change
      await new Promise(r => setTimeout(r, 600))

      const buffer = await page.screenshot({
        type:     'png',
        encoding: 'binary',
        // Explicit clip ensures we capture exactly the viewport
        clip: { x: 0, y: 0, width: VP_W, height: VP_H },
      })

      screenshots.push(buffer)
      console.log(' ✓')

      // Navigate to next slide
      if (i < SLIDES - 1) {
        await page.keyboard.press('ArrowRight')
      }
    }

    await browser.close()
    browser = null
    server.close()

    // 5. Compile into PDF
    console.log()
    process.stdout.write('  Building PDF ...')

    const pdfDoc = await PDFDocument.create()

    // PDF metadata
    pdfDoc.setTitle('Ontop — CS Operations Report 2024')
    pdfDoc.setAuthor('Customer Success Team')
    pdfDoc.setSubject('Annual churn analysis, NRR waterfall, sensitivity analysis')
    pdfDoc.setCreationDate(new Date())

    for (let i = 0; i < screenshots.length; i++) {
      // The PNG is VP_W*SCALE × VP_H*SCALE pixels.
      // PDF points = CSS pixels × 0.75  (96 dpi → 72 dpi)
      const ptW = VP_W * 0.75
      const ptH = VP_H * 0.75

      const pngImage = await pdfDoc.embedPng(screenshots[i])
      const pdfPage  = pdfDoc.addPage([ptW, ptH])

      // Draw image scaled to fill the page
      pdfPage.drawImage(pngImage, { x: 0, y: 0, width: ptW, height: ptH })
    }

    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(OUT_FILE, pdfBytes)

    const sizeMB = (pdfBytes.length / 1024 / 1024).toFixed(1)
    console.log(` done  (${sizeMB} MB)`)

    console.log()
    console.log(`✓  PDF saved → ${path.basename(OUT_FILE)}`)
    console.log(`   ${SLIDES} slides · ${VP_W}×${VP_H} px · ${SCALE}× resolution`)
    console.log()

  } catch (err) {
    if (browser) await browser.close()
    server.close()
    console.error('\n✗  Error:', err.message)
    process.exit(1)
  }
}

main()
