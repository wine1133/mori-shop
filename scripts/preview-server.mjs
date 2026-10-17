import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.cwd(), 'dist/build/h5')
const port = Number(process.env.PORT || 4173)
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
}

if (!existsSync(root)) {
  console.error('H5 build not found. Run `npm run build:h5` first.')
  process.exit(1)
}

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0])
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(root, safePath)

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(root, 'index.html')
  }

  response.setHeader('Content-Type', mime[extname(filePath)] || 'application/octet-stream')
  response.setHeader('Cache-Control', filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable')
  createReadStream(filePath).pipe(response)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`MORI H5 preview: http://127.0.0.1:${port}`)
})