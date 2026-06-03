// Creates prisma/base.db with all migrations applied and seed data loaded
// Run this once before packaging: node scripts/create-base-db.js
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')
const BASE_DB = path.join(ROOT, 'prisma', 'base.db')

if (fs.existsSync(BASE_DB)) {
  fs.unlinkSync(BASE_DB)
  console.log('base.db anterior eliminado')
}

const env = {
  ...process.env,
  DATABASE_URL: `file:${BASE_DB}`,
}

const opts = { stdio: 'inherit', cwd: ROOT, env }

console.log('Ejecutando migraciones...')
execSync('npx prisma migrate deploy', opts)

console.log('Ejecutando seed...')
execSync('npx prisma db seed', opts)

console.log(`base.db creado en: ${BASE_DB}`)
