const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT)
});

async function main() {
  const usuarios = [
    "paciente1",
    "medico1",
    "medico2"
  ];

  for (const username of usuarios) {
    const result = await pool.query(
      "SELECT contrasena FROM usuarios WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      console.log(`${username}: NO EXISTE`);
      continue;
    }

    const hash = result.rows[0].contrasena;

    const correcta = await bcrypt.compare(
      "123456",
      hash
    );

    console.log(`${username}:`);
    console.log(`  longitud: ${hash.length}`);
    console.log(`  prefijo: ${hash.substring(0, 7)}`);
    console.log(`  bcrypt: ${correcta}`);
  }

  await pool.end();
}

main().catch(async (error) => {
  console.error("ERROR:", error);
  await pool.end();
  process.exit(1);
});
