require('dotenv').config();
const http    = require('http');
const app     = require('./app');
const { initDb } = require('./config/sequelize');

const PORT = process.env.PORT || 3000;

(async () => {
  await initDb();

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`\n🚀 Novalife API  →  http://localhost:${PORT}`);
    console.log(`📋 Environment   →  ${process.env.NODE_ENV || 'development'}`);
    if (String(process.env.DISABLE_AUTH).toLowerCase() === 'true') {
      console.warn('\n⚠️  AUTH IS DISABLED  (DISABLE_AUTH=true in .env)');
      console.warn('   Set DISABLE_AUTH=false before going live.\n');
    }
  });

  const shutdown = () => { server.close(() => process.exit(0)); };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT',  shutdown);
})();
// Server entry point
