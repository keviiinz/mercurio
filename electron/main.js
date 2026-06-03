const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const http = require('http')

const PORT = 3001
const isDev = !app.isPackaged

let serverProcess = null
let win = null

function getDbPath() {
  return path.join(app.getPath('userData'), 'mercurio.db')
}

function initDatabase(dbPath) {
  if (fs.existsSync(dbPath)) return

  const baseDb = isDev
    ? path.join(__dirname, '..', 'prisma', 'base.db')
    : path.join(process.resourcesPath, 'base.db')

  if (!fs.existsSync(baseDb)) {
    console.warn('base.db no encontrado — la base de datos se creará vacía')
    return
  }

  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  fs.copyFileSync(baseDb, dbPath)
  console.log('Base de datos inicializada en:', dbPath)
}

function startServer(dbPath) {
  const standalonePath = isDev
    ? path.join(__dirname, '..', '.next', 'standalone')
    : path.join(process.resourcesPath, 'standalone')

  const dbUrl = 'file:' + dbPath.replace(/\\/g, '/')
  const enginePath = path.join(standalonePath, 'node_modules', '.prisma', 'client', 'query_engine-windows.dll.node')

  serverProcess = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      MERCURIO_STANDALONE_DIR: standalonePath,
      DATABASE_URL: dbUrl,
      PRISMA_QUERY_ENGINE_LIBRARY: enginePath,
      PORT: String(PORT),
      NODE_ENV: 'production',
    },
    stdio: 'pipe',
  })

  const logPath = path.join(app.getPath('userData'), 'server.log')
  const logStream = fs.createWriteStream(logPath, { flags: 'a' })
  const log = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`
    logStream.write(line)
    process.stdout.write(line)
  }

  log(`DATABASE_URL=${dbUrl}`)
  log(`ENGINE=${enginePath} exists=${fs.existsSync(enginePath)}`)
  log(`standalone=${standalonePath} exists=${fs.existsSync(standalonePath)}`)

  serverProcess.stdout.on('data', d => log('[stdout] ' + d.toString().trim()))
  serverProcess.stderr.on('data', d => log('[stderr] ' + d.toString().trim()))
  serverProcess.on('error', err => log('[error] ' + err.message))
  serverProcess.on('exit', code => log('[exit] code=' + code))
}

function waitForServer(port, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout

    function check() {
      const req = http.get(`http://localhost:${port}`, res => {
        res.resume()
        resolve()
      })
      req.on('error', () => {
        if (Date.now() > deadline) return reject(new Error('Tiempo de espera agotado al iniciar el servidor'))
        setTimeout(check, 600)
      })
      req.setTimeout(1000, () => {
        req.destroy()
        if (Date.now() > deadline) return reject(new Error('Tiempo de espera agotado al iniciar el servidor'))
        setTimeout(check, 600)
      })
    }

    setTimeout(check, 1500)
  })
}

app.whenReady().then(async () => {
  win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 900,
    minHeight: 600,
    title: 'Mercurio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    win.loadURL(`http://localhost:${PORT}`)
    return
  }

  win.loadFile(path.join(__dirname, 'loading.html'))

  const dbPath = getDbPath()
  initDatabase(dbPath)
  startServer(dbPath)

  try {
    await waitForServer(PORT)
    win.loadURL(`http://localhost:${PORT}/login`)
  } catch (err) {
    console.error(err)
    win.loadURL(
      `data:text/html;charset=utf-8,<html><body style="font-family:sans-serif;padding:2rem"><h2>No se pudo iniciar Mercurio</h2><p>${err.message}</p><p>Intenta reiniciar la aplicación.</p></body></html>`
    )
  }
})

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    win = new BrowserWindow({
      width: 1366,
      height: 768,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    })
    win.loadURL(`http://localhost:${PORT}`)
  }
})
