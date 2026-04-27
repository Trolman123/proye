const { Client } = require('pg');
require('dotenv').config();

const createDb = async () => {
  // Conectar a la base de datos por defecto 'postgres' para crear la nueva DB
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Conectado a PostgreSQL base...');
    
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`✓ Base de datos "${process.env.DB_NAME}" creada exitosamente.`);
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`! La base de datos "${process.env.DB_NAME}" ya existe.`);
    } else {
      console.error('✗ Error completo:', err);
    }
  } finally {
    await client.end();
  }
};

createDb();
