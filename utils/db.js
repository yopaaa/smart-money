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
    hidden INTEGER
  );
`);

    db.execSync(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    accountId TEXT,
    createdAt TEXT
  );
`);


    const existing = db.getAllSync('SELECT COUNT(*) as total FROM accounts');
    if (existing[0]?.total === 0) {
        console.log('⏳ Menambahkan akun default...');
        db.runSync(
            `INSERT INTO accounts (id, name, balance, type, isLiability, hidden)
       VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?);`,
            [
                'acc-1', 'Dompet', 100000, 'cash', 0, 0,   // akun pertama
                'acc-2', 'Rekening Bank', 500000, 'debit', 0, 0 // akun kedua
            ]
        );
    }

    // Tambahkan satu transaksi default jika belum ada
    const existingTx = db.getAllSync('SELECT COUNT(*) as total FROM transactions');
    if (existingTx[0]?.total === 0) {
        console.log('🧾 Menambahkan transaksi default...');
        const now = new Date().toISOString();
        db.runSync(
            `INSERT INTO transactions (id, title, amount, type, accountId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?);`,
            [generateId(), 'Saldo awal', 0, 'income', 'acc-1', now]
        );
    }
};

export const getTransactions = () => {
    return db.getAllSync(`SELECT * FROM transactions ORDER BY createdAt DESC`);
};

export const addTransaction = (transaction) => {
    /*
      transaction = {
        title: string,
        amount: number,
        type: 'income' | 'expense' | 'transfer',
        accountId: string,
        targetAccountId?: string, // untuk transfer
        createdAt: string (ISO date),
      }
    */

    try {
        db.execSync('BEGIN TRANSACTION;');

        // Insert transaksi
        const id = generateId();
        db.runSync(
            `INSERT INTO transactions (id, title, amount, type, accountId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?);`,
            [id, transaction.title, transaction.amount, transaction.type, transaction.accountId, transaction.createdAt]
        );

        // Update saldo akun utama
        const accounts = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [transaction.accountId]);
        if (accounts.length === 0) throw new Error('Akun tidak ditemukan');
        const account = accounts[0];
        let newBalance = account.balance;

        if (transaction.type === 'income') {
            newBalance += transaction.amount;
        } else if (transaction.type === 'expense') {
            newBalance -= transaction.amount;
        } else if (transaction.type === 'transfer') {
            // Proses khusus
            newBalance = account.balance - transaction.amount;

            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, transaction.accountId]);

            // Tambah saldo akun tujuan
            const targetAccounts = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [transaction.targetAccountId]);
            if (targetAccounts.length === 0) throw new Error('Akun tujuan tidak ditemukan');
            const targetAccount = targetAccounts[0];
            const targetNewBalance = targetAccount.balance + transaction.amount;
            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [targetNewBalance, transaction.targetAccountId]);

            // Catat transaksi tambahan ke akun tujuan (sebagai income)
            const targetTransactionId = generateId();
            db.runSync(
                `INSERT INTO transactions (id, title, amount, type, accountId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?);`,
                [targetTransactionId, `Transfer dari ${account.name}`, transaction.amount, 'income', transaction.targetAccountId, transaction.createdAt]
            );

            db.execSync('COMMIT;');
            return; // supaya tidak lanjut ke update saldo di bawah
        }


        db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, transaction.accountId]);

        // Jika transfer, kurangi saldo di akun asal, tambah di akun tujuan
        if (transaction.type === 'transfer' && transaction.targetAccountId) {
            // Kurangi saldo akun asal
            newBalance = account.balance - transaction.amount;
            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, transaction.accountId]);

            // Tambah saldo akun tujuan
            const targetAccounts = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [transaction.targetAccountId]);
            if (targetAccounts.length === 0) throw new Error('Akun tujuan tidak ditemukan');
            const targetAccount = targetAccounts[0];
            const targetNewBalance = targetAccount.balance + transaction.amount;
            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [targetNewBalance, transaction.targetAccountId]);

            // Catat transaksi juga di akun tujuan sebagai pemasukan (optional)
            const targetTransactionId = generateId();
            db.runSync(
                `INSERT INTO transactions (id, title, amount, type, accountId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?);`,
                [targetTransactionId, `Transfer dari ${account.name}`, transaction.amount, 'income', transaction.targetAccountId, transaction.createdAt]
            );
        }

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

export const insertAccount = (account) => {
    db.runSync(
        `INSERT INTO accounts (id, name, balance, type, isLiability, hidden)
     VALUES (?, ?, ?, ?, ?, ?);`,
        [
            account.id,
            account.name,
            account.balance,
            account.type,
            account.isLiability ? 1 : 0,
            account.hidden ? 1 : 0
        ]
    );
};