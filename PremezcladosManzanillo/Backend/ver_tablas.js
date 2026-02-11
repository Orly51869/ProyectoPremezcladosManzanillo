const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('--- TABLAS EN LA BASE DE DATOS ---');
db.serialize(() => {
    db.each("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations'", (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(`- ${row.name}`);
    });
});

db.close();
