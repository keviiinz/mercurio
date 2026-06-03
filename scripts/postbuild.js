// Copies required files into .next/standalone after `next build`
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  Omitido (no existe): ${path.relative(ROOT, src)}`)
    return
  }
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

const standalone = path.join(ROOT, '.next', 'standalone')

if (!fs.existsSync(standalone)) {
  console.error('ERROR: .next/standalone no existe. Ejecuta "next build" primero.')
  process.exit(1)
}

console.log('Copiando archivos estáticos...')
copyDir(
  path.join(ROOT, '.next', 'static'),
  path.join(standalone, '.next', 'static')
)

console.log('Copiando directorio public...')
copyDir(
  path.join(ROOT, 'public'),
  path.join(standalone, 'public')
)

console.log('Copiando binarios de Prisma...')
copyDir(
  path.join(ROOT, 'node_modules', '.prisma'),
  path.join(standalone, 'node_modules', '.prisma')
)

console.log('Corrigiendo aliases de Turbopack (@prisma/client-*)...')
const turbopackPrismaDir = path.join(standalone, '.next', 'node_modules', '@prisma')
if (fs.existsSync(turbopackPrismaDir)) {
  for (const entry of fs.readdirSync(turbopackPrismaDir)) {
    if (!entry.startsWith('client-')) continue
    const srcDir = path.join(turbopackPrismaDir, entry)
    // Eliminar el dir vacío de .next/node_modules (electron-builder lo omite de todas formas)
    fs.rmSync(srcDir, { recursive: true, force: true })
    // Crear el alias en standalone/node_modules donde electron-builder SÍ lo empaqueta
    const destDir = path.join(standalone, 'node_modules', '@prisma', entry)
    fs.mkdirSync(destDir, { recursive: true })
    fs.writeFileSync(
      path.join(destDir, 'index.js'),
      '"use strict";\nmodule.exports = require("@prisma/client");\n'
    )
    console.log(`  Alias creado: @prisma/${entry}`)
  }
}

const standaloneEnv = path.join(standalone, '.env')
if (fs.existsSync(standaloneEnv)) {
  fs.unlinkSync(standaloneEnv)
  console.log('Eliminado .env del standalone (DATABASE_URL se inyecta en runtime).')
}

console.log('Post-build completado.')
