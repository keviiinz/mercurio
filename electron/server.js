// Runs as child process with ELECTRON_RUN_AS_NODE=1
// Starts the Next.js standalone server
const path = require('path')

const standalonePath = process.env.MERCURIO_STANDALONE_DIR

if (!standalonePath) {
  console.error('MERCURIO_STANDALONE_DIR no está definido')
  process.exit(1)
}

try {
  require(path.join(standalonePath, 'server.js'))
} catch (err) {
  console.error('No se pudo iniciar el servidor Next.js:', err)
  process.exit(1)
}
