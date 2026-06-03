const { createServer } = require('http')
const { readFileSync, existsSync } = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.ico': 'image/x-icon' }

createServer((req, res) => {
  const file = req.url === '/' ? 'index.html' : req.url.slice(1)
  const filePath = path.join(__dirname, file)
  if (existsSync(filePath)) {
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' })
    res.end(readFileSync(filePath))
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(PORT, () => console.log(`Landing en puerto ${PORT}`))
