import * as SQLite from 'expo-sqlite';
import generateId from './generateId';
const db = SQLite.openDatabaseSync('smart_money.db');

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

    // const existing = db.getAllSync('SELECT COUNT(*) as total FROM accounts');
    // if (existing[0]?.total === 0) {
    //     console.log('⏳ Menambahkan akun default...');
    //     addAccount({
    //         id: 'acc-1',
    //         name: "Dompet",
    //         balance: 100000,
    //         type: "cash",
    //         isLiability: 0,
    //         hidden: 0,
    //         icon: "wallet",
    //         iconColor: "#4caf50",
    //         description: ""
    //     })
    //     addAccount({
    //         id: 'acc-2',
    //         name: 'Rekening Bank',
    //         balance: 500000,
    //         type: "debit",
    //         isLiability: 0,
    //         hidden: 0,
    //         icon: "bank",
    //         iconColor: "#2196f3",
    //         description: ""
    //     })
    // }
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
export const getTransactions = () => {
    return db.getAllSync(`SELECT * FROM transactions ORDER BY createdAt DESC`);
};

/**
 * Fungsi untuk mendapatkan transaksi berdasarkan ID
 * @param {string} id - ID transaksi yang dicari
 * @returns {Object|null} Objek transaksi jika ditemukan, null jika tidak
 */
export const getTransactionById = (id) => {
    try {
        const sql = `SELECT * FROM transactions WHERE id = ? LIMIT 1`;
        const params = [id];

        const result = db.getAllSync(sql, params);

        if (result.length > 0) {
            return result[0];
        }

        return null;
    } catch (e) {
        console.error('Gagal mendapatkan transaksi:', e.message);
        throw e;
    }
};

export const addTransaction = (
    transaction = {
        title: String,
        description: String,
        amount: Number,
        type: String,
        accountId: String,
        targetAccountId: null,
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
                (id, title, description, amount, type, accountId, targetAccountId, createdAt, category, fee)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                id,
                transaction.title,
                transaction.description || null,
                transaction.amount,
                transaction.type,
                transaction.accountId,
                transaction.targetAccountId,
                transaction.createdAt,
                transaction.category || null,
                transaction.fee || 0
            ]
        );

        // Update main account balance
        const accounts = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [transaction.accountId]);
        if (accounts.length === 0) {
            console.log(transaction);
            
            throw new Error('Akun tidak ditemukan')};
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

            // Record fee as separate expense if exists
            if (transaction.fee && transaction.fee > 0) {
                const feeTransactionId = generateId();
                db.runSync(
                    `INSERT INTO transactions 
                        (id, title, description, amount, type, accountId, targetAccountId, createdAt, category)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        feeTransactionId,
                        `Biaya transfer`,
                        `Biaya transfer ke ${targetAccount.name}`,
                        transaction.fee,
                        'expense',
                        transaction.accountId,
                        transaction.targetAccountId,
                        transaction.createdAt,
                        'Biaya Admin'
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

export const editTransaction = (id, updatedTransaction) => {
    try {
        db.execSync('BEGIN TRANSACTION;');

        // Ambil data transaksi lama
        const existing = db.getAllSync('SELECT * FROM transactions WHERE id = ?', [id]);
        if (existing.length === 0) throw new Error('Transaksi tidak ditemukan');
        const oldTx = existing[0];

        // Rollback saldo berdasarkan transaksi lama
        if (oldTx.type === 'income') {
            db.runSync(
                'UPDATE accounts SET balance = balance - ? WHERE id = ?',
                [oldTx.amount, oldTx.accountId]
            );
        } else if (oldTx.type === 'expense') {
            db.runSync(
                'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                [oldTx.amount, oldTx.accountId]
            );
        } else if (oldTx.type === 'transfer') {
            // rollback saldo transfer
            db.runSync(
                'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                [oldTx.amount + (oldTx.fee || 0), oldTx.accountId]
            );
            db.runSync(
                'UPDATE accounts SET balance = balance - ? WHERE id = ?',
                [oldTx.amount, oldTx.targetAccountId]
            );
            // hapus transaksi fee jika ada
            db.runSync('DELETE FROM transactions WHERE title = ? AND createdAt = ? AND accountId = ?',
                ['Biaya transfer', oldTx.createdAt, oldTx.accountId]);
        }

        // Update transaksi utama
        db.runSync(`
      UPDATE transactions SET 
        title = ?, description = ?, amount = ?, type = ?, accountId = ?, 
        targetAccountId = ?, createdAt = ?, category = ?, fee = ?
      WHERE id = ?
    `, [
            updatedTransaction.title,
            updatedTransaction.description || null,
            updatedTransaction.amount,
            updatedTransaction.type,
            updatedTransaction.accountId,
            updatedTransaction.targetAccountId,
            updatedTransaction.createdAt,
            updatedTransaction.category || null,
            updatedTransaction.fee || 0,
            id
        ]);

        // Terapkan saldo baru
        if (updatedTransaction.type === 'income') {
            db.runSync(
                'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                [updatedTransaction.amount, updatedTransaction.accountId]
            );
        } else if (updatedTransaction.type === 'expense') {
            db.runSync(
                'UPDATE accounts SET balance = balance - ? WHERE id = ?',
                [updatedTransaction.amount, updatedTransaction.accountId]
            );
        } else if (updatedTransaction.type === 'transfer') {
            const totalDeduction = updatedTransaction.amount + (updatedTransaction.fee || 0);
            db.runSync(
                'UPDATE accounts SET balance = balance - ? WHERE id = ?',
                [totalDeduction, updatedTransaction.accountId]
            );
            db.runSync(
                'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                [updatedTransaction.amount, updatedTransaction.targetAccountId]
            );

            // Tambahkan transaksi fee baru jika ada
            if (updatedTransaction.fee && updatedTransaction.fee > 0) {
                const feeId = generateId();
                db.runSync(`
          INSERT INTO transactions
          (id, title, description, amount, type, accountId, targetAccountId, createdAt, category)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    feeId,
                    `Biaya transfer`,
                    `Biaya transfer ke akun`,
                    updatedTransaction.fee,
                    'expense',
                    updatedTransaction.accountId,
                    updatedTransaction.targetAccountId,
                    updatedTransaction.createdAt,
                    'Biaya Admin'
                ]);
            }
        }

        db.execSync('COMMIT;');
    } catch (e) {
        db.execSync('ROLLBACK;');
        console.error('Gagal mengedit transaksi:', e.message);
        throw e;
    }
};

export const deleteTransaction = (id) => {
    try {
        db.execSync('BEGIN TRANSACTION;');

        // Ambil transaksi yang akan dihapus
        const existing = db.getAllSync('SELECT * FROM transactions WHERE id = ?', [id]);
        if (existing.length === 0) throw new Error('Transaksi tidak ditemukan');
        const tx = existing[0];

        // Rollback efek saldo
        if (tx.type === 'income') {
            db.runSync('UPDATE accounts SET balance = balance - ? WHERE id = ?', [tx.amount, tx.accountId]);
        } else if (tx.type === 'expense') {
            db.runSync('UPDATE accounts SET balance = balance + ? WHERE id = ?', [tx.amount, tx.accountId]);
        } else if (tx.type === 'transfer') {
            const totalDeduction = tx.amount + (tx.fee || 0);
            // Kembalikan saldo akun asal
            db.runSync('UPDATE accounts SET balance = balance + ? WHERE id = ?', [totalDeduction, tx.accountId]);
            // Kurangi saldo akun tujuan
            db.runSync('UPDATE accounts SET balance = balance - ? WHERE id = ?', [tx.amount, tx.targetAccountId]);

            // Cek dan hapus fee transfer jika ada
            db.runSync(
                `DELETE FROM transactions 
         WHERE title = 'Biaya transfer' 
         AND createdAt = ? 
         AND accountId = ?
         AND targetAccountId = ?`,
                [tx.createdAt, tx.accountId, tx.targetAccountId]
            );
        }

        // Hapus transaksi utama
        db.runSync('DELETE FROM transactions WHERE id = ?', [id]);

        db.execSync('COMMIT;');
    } catch (e) {
        db.execSync('ROLLBACK;');
        console.error('Gagal menghapus transaksi:', e.message);
        throw e;
    }
};

/**
 * Fungsi untuk filter transaksi dengan berbagai kriteria
 * @param {Object} query - Objek berisi parameter filter
 * @param {string} [query.search] - Pencarian di title/description (case insensitive)
 * @param {string} [query.type] - Jenis transaksi (income/expense/transfer)
 * @param {string} [query.category] - Kategori transaksi
 * @param {string} [query.accountId] - ID akun terkait
 * @param {number} [query.minAmount] - Jumlah minimum
 * @param {number} [query.maxAmount] - Jumlah maksimum
 * @param {number} [query.startDate] - Timestamp awal (createdAt >= startDate)
 * @param {number} [query.endDate] - Timestamp akhir (createdAt <= endDate)
 * @returns {Array} Array transaksi yang memenuhi kriteria
 */
export const filterTransactions = (query = {}) => {
    try {
        // Base query
        let sql = `SELECT * FROM transactions WHERE 1=1`;
        const params = [];

        // Dynamic filter builder
        if (query.search) {
            sql += ` AND (title LIKE ? OR description LIKE ?)`;
            params.push(`%${query.search}%`, `%${query.search}%`);
        }

        if (query.type) {
            sql += ` AND type = ?`;
            params.push(query.type);
        }

        if (query.category) {
            sql += ` AND category = ?`;
            params.push(query.category);
        }

        if (query.accountId) {
            sql += ` AND (accountId = ? OR targetAccountId = ?)`;
            params.push(query.accountId, query.accountId);
        }

        if (query.minAmount !== undefined) {
            sql += ` AND amount >= ?`;
            params.push(query.minAmount);
        }

        if (query.maxAmount !== undefined) {
            sql += ` AND amount <= ?`;
            params.push(query.maxAmount);
        }

        if (query.startDate) {
            sql += ` AND createdAt >= ?`;
            params.push(query.startDate);
        }

        if (query.endDate) {
            sql += ` AND createdAt <= ?`;
            params.push(query.endDate);
        }

        // Sorting default: terbaru dulu
        sql += ` ORDER BY createdAt DESC`;

        return db.getAllSync(sql, params);
    } catch (e) {
        console.error('Gagal memfilter transaksi:', e.message);
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
