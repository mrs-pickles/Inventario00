/**
 * Ejecuta un .sql en PostgreSQL (misma conexión que orm.config.ts).
 * Uso: node scripts/run-sql.cjs [ruta relativa desde la carpeta backend]
 * Ej.:  node scripts/run-sql.cjs sql/seed_little_trees.sql
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const backendRoot = path.join(__dirname, "..");
const fileArg = process.argv[2] || "sql/seed_little_trees.sql";
const filePath = path.isAbsolute(fileArg)
  ? fileArg
  : path.join(backendRoot, fileArg);

if (!fs.existsSync(filePath)) {
  console.error("No se encuentra el archivo:", filePath);
  process.exit(1);
}

const sql = fs.readFileSync(filePath, "utf8");

const client = new Client({
  host: "127.0.0.1",
  port: 5223,
  user: "inventario",
  password: "1844",
  database: "inventario-db",
});

(async () => {
  await client.connect();
  try {
    await client.query(sql);
    console.log("Listo. Ejecutado:", path.basename(filePath));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
