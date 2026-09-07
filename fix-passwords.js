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
    const hash = await bcrypt.hash("123456", 10);

    await pool.query(
      "UPDATE usuarios SET contrasena = $1 WHERE username = $2",
      [hash, username]
    );

    console.log(`${username}: ${hash}`);
  }

  await pool.end();

  console.log("Contraseñas actualizadas correctamente.");
}

main().catch(async (error) => {
  console.error("ERROR:", error);
  await pool.end();
  process.exit(1);
});
