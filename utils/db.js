import * as SQLite from 'expo-sqlite';
import generateId from './generateId';
const db = SQLite.openDatabaseSync('money_manager.db');

export const initDB = () => {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL,
    type TEXT NOT NULL,
    isLiability INTEGER,
    hidden INTEGER,
    icon TEXT,
    iconColor TEXT,
    description TEXT
    );`
    );

    const existing = db.getAllSync('SELECT COUNT(*) as total FROM accounts');
    if (existing[0]?.total === 0) {
        console.log('⏳ Menambahkan akun default...');
        addAccount({
            id: 'acc-1',
            name: "Dompet",
            balance: 100000,
            type: "cash",
            isLiability: 0,
            hidden: 0,
            icon: "wallet",
            iconColor: "#4caf50",
            description: ""
        })
        addAccount({
            id: 'acc-2',
            name: 'Rekening Bank',
            balance: 500000,
            type: "debit",
            isLiability: 0,
            hidden: 0,
            icon: "bank",
            iconColor: "#2196f3",
            description: ""
        })
    }

    db.execSync(`
    CREATE TABLE IF NOT EXISTS transactions (
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
        FOREIGN KEY (accountId) REFERENCES accounts(id),
        FOREIGN KEY (targetAccountId) REFERENCES accounts(id)
    );`);

    const existingTx = db.getAllSync('SELECT COUNT(*) as total FROM transactions');
    if (existingTx[0]?.total === 0) {
        console.log('🧾 Menambahkan transaksi default...');
        addTransaction({
            title: 'Transaksi awal',
            description: 'Transaksi awal akun',
            amount: 0,
            type: 'income',
            accountId: 'acc-1',
            targetAccountId: undefined,
            createdAt: Date.now(),
            category: "Pendapatan",
            fee: 0
        })
    }
};

export const getTransactions = () => {
    return db.getAllSync(`SELECT * FROM transactions ORDER BY createdAt DESC`);
};

/*
    {
        id: string,
        title: string,
        description: string,
        amount: number,
        type: 'income' | 'expense' | 'transfer',
        accountId: string,
        targetAccountId?: string, // untuk transfer
        createdAt: string (ISO date),
        category:  string,
        fee
      }
*/

export const addTransaction = (
    transaction = {
        title: String,
        description: String,
        amount: Number,
        type: String,
        accountId: String,
        targetAccountId: String,
        createdAt: Number,
        category: String,
        fee: NUmber
    }
) => {
    try {
        db.execSync('BEGIN TRANSACTION;');

        // Insert main transaction
        const id = generateId();
        db.runSync(
            `INSERT INTO transactions 
                (id, title, description, amount, type, accountId, createdAt, category, fee)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                id,
                transaction.title,
                transaction.description || null,
                0 + transaction.amount,
                transaction.type,
                transaction.accountId,
                transaction.createdAt,
                transaction.category || null,
                transaction.fee || 0
            ]
        );

        // Update main account balance
        const accounts = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [transaction.accountId]);
        if (accounts.length === 0) throw new Error('Akun tidak ditemukan');
        const account = accounts[0];
        let newBalance = account.balance;

        if (transaction.type === 'income') {
            newBalance += transaction.amount;
        } else if (transaction.type === 'expense') {
            newBalance -= transaction.amount;
        } else if (transaction.type === 'transfer') {
            if (!transaction.targetAccountId) throw new Error('Akun tujuan transfer harus diisi');

            // Deduct from source account (including fee if any)
            const totalDeduction = transaction.amount + (transaction.fee || 0);
            newBalance = account.balance - totalDeduction;
            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, transaction.accountId]);

            // Add to target account
            const targetAccounts = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [transaction.targetAccountId]);
            if (targetAccounts.length === 0) throw new Error('Akun tujuan tidak ditemukan');
            const targetAccount = targetAccounts[0];
            const targetNewBalance = targetAccount.balance + transaction.amount;
            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [targetNewBalance, transaction.targetAccountId]);

            // Record transaction in target account (as income)
            const targetTransactionId = generateId();
            db.runSync(
                `INSERT INTO transactions 
                    (id, title, description, amount, type, accountId, createdAt, category, fee)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    targetTransactionId,
                    `Transfer dari ${account.name}`,
                    transaction.description || null,
                    transaction.amount,
                    'income',
                    transaction.targetAccountId,
                    transaction.createdAt,
                    transaction.category || null,
                    0
                ]
            );

            // Record fee as separate expense if exists
            if (transaction.fee && transaction.fee > 0) {
                const feeTransactionId = generateId();
                db.runSync(
                    `INSERT INTO transactions 
                        (id, title, description, amount, type, accountId, createdAt, category)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        feeTransactionId,
                        `Biaya transfer`,
                        `Biaya transfer ke ${targetAccount.name}`,
                        transaction.fee,
                        'expense',
                        transaction.accountId,
                        transaction.createdAt,
                        'Biaya Transfer'
                    ]
                );
            }

            db.execSync('COMMIT;');
            return;
        }

        // For regular income/expense transactions
        db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, transaction.accountId]);

        db.execSync('COMMIT;');
    } catch (e) {
        db.execSync('ROLLBACK;');
        console.error('Gagal menambahkan transaksi:', e.message);
        throw e;
    }
};

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
