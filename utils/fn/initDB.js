import { db } from '../db';


import defaultCategories from '../defaultCategories.json';
import { addCategory } from './category';

export const ACCOUNT_TABLE_NAME = "accounts";
export const TRANSACTION_TABLE_NAME = "transactions";
export const CATEGORIES_TABLE_NAME = "categories";
export const SETTINGS_TABLE_NAME = "settings";

export const initDB = () => {

    db.execSync(`
    CREATE TABLE IF NOT EXISTS ${ACCOUNT_TABLE_NAME} (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL,
    type TEXT NOT NULL,
    isLiability INTEGER,
    hidden INTEGER,
    icon TEXT,
    iconColor TEXT,
    description TEXT,
    INTEGER DEFAULT 0
    );`
    );

    db.execSync(`
    CREATE TABLE IF NOT EXISTS ${TRANSACTION_TABLE_NAME} (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        accountId TEXT NOT NULL,
        targetAccountId TEXT,
        createdAt TEXT NOT NULL,
        category TEXT,
        fee INTEGER DEFAULT 0,
        img TEXT,
        FOREIGN KEY (accountId) REFERENCES accounts(id),
        FOREIGN KEY (targetAccountId) REFERENCES accounts(id)
    );`);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS ${CATEGORIES_TABLE_NAME} (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL
    );`);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS ${SETTINGS_TABLE_NAME} (
        id TEXT PRIMARY KEY NOT NULL,
        key TEXT UNIQUE NOT NULL,
        value TEXT
    );`);

    const existing = db.getAllSync(`SELECT COUNT(*) as total FROM ${CATEGORIES_TABLE_NAME}`);
    if (existing[0]?.total === 0) {
        console.log('⏳ Menambahkan category default...');
        defaultCategories.map(val => {
            addCategory(val)
        })
    }

    addColumnIfNotExists(TRANSACTION_TABLE_NAME, 'img', "TEXT");
    addColumnIfNotExists(ACCOUNT_TABLE_NAME, 'isFavorite', "INTEGER DEFAULT 0");
};


export function resetTables() {
    try {
        db.execSync('BEGIN TRANSACTION');

        // Hapus semua tabel (jika ingin bersih total)
        db.execSync(`DROP TABLE IF EXISTS ${ACCOUNT_TABLE_NAME}`);
        db.execSync(`DROP TABLE IF EXISTS ${TRANSACTION_TABLE_NAME}`);
        db.execSync(`DROP TABLE IF EXISTS ${CATEGORIES_TABLE_NAME}`);
        db.execSync(`DROP TABLE IF EXISTS ${SETTINGS_TABLE_NAME}`);
        // (Tambahkan CREATE TABLE lainnya jika ada, misalnya transactions atau categories)

        db.execSync('COMMIT');
        console.log('✅ Semua tabel berhasil di-reset');
        initDB()
    } catch (error) {
        db.execSync('ROLLBACK');
        console.error('❌ Gagal reset tabel:', error);
    }
}


export function addColumnIfNotExists(tableName, columnName, columnDefinition) {
    try {
        const columns = db.getAllSync(`PRAGMA table_info(${tableName})`);

        const exists = columns.some(col => col.name === columnName);
        if (exists) {
            return;
        }

        const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`;
        db.execSync(sql);
        console.log(`✅ Kolom '${columnName}' berhasil ditambahkan ke tabel '${tableName}'`);
    } catch (e) {
        console.error(`❌ Gagal menambahkan kolom '${columnName}' ke '${tableName}':`, e.message);
    }
}
