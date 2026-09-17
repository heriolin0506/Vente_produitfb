const { DatabaseSync } = require('node:sqlite');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, process.env.DB_NAME || 'impact_pc.db');
const db = new DatabaseSync(dbPath);

console.log("Tafiditra tao amin'ny SQLite: " + dbPath);

// Famoronana ny Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);
console.log("Table admin: Vonona");

db.exec(`
    CREATE TABLE IF NOT EXISTS produits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        categorie TEXT,
        marque TEXT,
        prix REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        description TEXT,
        specs TEXT,
        images TEXT,
        date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
console.log("Table produits: Vonona");

// Fonction hanamboarana ny "db.all" sy "db.get" ho an'ny SQLite
db.all = (sql, params, callback) => {
    try {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        callback(null, rows);
    } catch (err) {
        callback(err, null);
    }
};

db.get = (sql, params, callback) => {
    try {
        const stmt = db.prepare(sql);
        const row = stmt.get(...params);
        callback(null, row);
    } catch (err) {
        callback(err, null);
    }
};

db.run = (sql, params, callback) => {
    try {
        const stmt = db.prepare(sql);
        stmt.run(...params);
        if (callback) callback(null);
    } catch (err) {
        if (callback) callback(err);
    }
};

module.exports = db;