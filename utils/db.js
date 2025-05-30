import * as SQLite from 'expo-sqlite';
import { initDB } from './fn/initDB';
import { addTransaction } from './fn/transaction';
import generateId from './generateId';
export const db = SQLite.openDatabaseSync('smart_money.db');


export const getAccounts = () => {
    const result = db.getAllSync('SELECT * FROM accounts');
    return result; // langsung return array of rows
};

export const addAccount = (account) => {
    const id = account.id || generateId();
    const initialBalance = account.balance || 0;

    // Insert account with 0 balance first
    db.runSync(
        `INSERT INTO accounts (id, name, balance, type, isLiability, hidden, icon, iconColor, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
            id,
            account.name,
            0, // Always insert with 0 balance initially
            account.type,
            account.isLiability ? 1 : 0,
            account.hidden ? 1 : 0,
            account.icon || 'wallet',
            account.iconColor || '#4caf50',
            account.description || '',
        ]
    );

    if (initialBalance > 0) {
        const transactionType = account.isLiability ? 'expense' : 'income';
        const transactionTitle = `Initial balance for ${account.name}`;

        addTransaction({
            title: transactionTitle,
            description: `Initial balance setup for account ${account.name}`,
            amount: Math.abs(initialBalance),
            type: transactionType,
            accountId: id,
            targetAccountId: null,
            createdAt: Date.now(),
            category: 'initial-balance',
            fee: 0
        });
    }
};


export function resetTables() {
    try {
        db.execSync('BEGIN TRANSACTION');

        // Hapus semua tabel (jika ingin bersih total)
        db.execSync(`DROP TABLE IF EXISTS transactions`);
        db.execSync(`DROP TABLE IF EXISTS accounts`);
        db.execSync(`DROP TABLE IF EXISTS categories`);
        // (Tambahkan CREATE TABLE lainnya jika ada, misalnya transactions atau categories)

        db.execSync('COMMIT');
        console.log('✅ Semua tabel berhasil di-reset');
        initDB()
    } catch (error) {
        db.execSync('ROLLBACK');
        console.error('❌ Gagal reset tabel:', error);
    }
}
