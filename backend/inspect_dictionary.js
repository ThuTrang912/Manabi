import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "dictionary.db");

try {
  const db = new Database(dbPath, { readonly: true });
  
  console.log("=== DICTIONARY.DB SCHEMA ===\n");
  
  // Lấy tất cả bảng
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(`Total tables: ${tables.length}\n`);
  
  tables.forEach((table) => {
    console.log(`\n--- Table: ${table.name} ---`);
    
    // Lấy cấu trúc cột
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log("Columns:");
    columns.forEach((col) => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? "NOT NULL" : ""} ${col.pk ? "PRIMARY KEY" : ""}`);
    });
    
    // Đếm số dòng
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${table.name}`).get();
    console.log(`Row count: ${count.cnt}`);
    
    // Hiển thị vài dòng mẫu
    if (count.cnt > 0) {
      const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
      console.log("Sample data:");
      console.log(JSON.stringify(sample, null, 2));
    }
  });
  
  db.close();
  console.log("\n=== END SCHEMA ===");
} catch (error) {
  console.error("Error:", error.message);
  console.error("Make sure better-sqlite3 is installed: npm install better-sqlite3");
}
