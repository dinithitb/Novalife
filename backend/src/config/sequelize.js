const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    pool:    { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define:  { underscored: true, freezeTableName: false },
  }
);

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('\n❌ Database connection failed:', err.message);
    console.error('👉 Check these values in backend/.env:');
    console.error(`   DB_HOST     = ${process.env.DB_HOST}`);
    console.error(`   DB_PORT     = ${process.env.DB_PORT}`);
    console.error(`   DB_NAME     = ${process.env.DB_NAME}`);
    console.error(`   DB_USER     = ${process.env.DB_USER}`);
    console.error(`   DB_PASSWORD = (hidden)\n`);
    process.exit(1);
  }
  require('../models'); // register all models
  await sequelize.sync({ alter: true });
  console.log('✅ Database tables ready');
}

module.exports = { sequelize, initDb };
