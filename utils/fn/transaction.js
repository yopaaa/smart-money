import { db } from '../db';
import generateId from '../generateId';
import { ACCOUNT_TABLE_NAME, TRANSACTION_TABLE_NAME } from './initDB';
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
        fee: string,
        img: string
      }
*/

export const getTransactions = () => {
    return db.getAllSync(`SELECT * FROM ${TRANSACTION_TABLE_NAME} ORDER BY createdAt DESC`);
};

export const getTransactionById = (id) => {
    try {
        const sql = `SELECT * FROM ${TRANSACTION_TABLE_NAME} WHERE id = ? LIMIT 1`;
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
        fee: NUmber,
        img, String,
    }
) => {
    try {
        db.execSync('BEGIN TRANSACTION;');

        // Insert main transaction
        const id = generateId();
        db.runSync(
            `INSERT INTO ${TRANSACTION_TABLE_NAME} 
                (id, title, description, amount, type, accountId, targetAccountId, createdAt, category, fee, img)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
                transaction.fee || 0,
                transaction.img || ""
            ]
        );

        // Update main account balance
        const accounts = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [transaction.accountId]);
        if (accounts.length === 0) {
            throw new Error('Akun tidak ditemukan')
        };
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
                    `INSERT INTO ${TRANSACTION_TABLE_NAME} 
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
                        transaction.createdAt + 1,
                        'Biaya Admin'
                    ]
                );
            }

            db.execSync('COMMIT;');
            return;
        }

        // For regular income/expense ${TRANSACTION_TABLE_NAME}
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
        const existing = db.getAllSync(`SELECT * FROM ${TRANSACTION_TABLE_NAME} WHERE id = ?`, [id]);
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
            db.runSync(
                'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                [oldTx.amount + (oldTx.fee || 0), oldTx.accountId]
            );
            db.runSync(
                'UPDATE accounts SET balance = balance - ? WHERE id = ?',
                [oldTx.amount, oldTx.targetAccountId]
            );
        }

        // Update transaksi utama
        db.runSync(`
            UPDATE ${TRANSACTION_TABLE_NAME} SET 
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

        // Terapkan saldo baru dan log baru
        if (updatedTransaction.type === 'income') {
            const account = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [updatedTransaction.accountId])[0];
            const newBalance = account.balance + updatedTransaction.amount;
            db.runSync(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [newBalance, updatedTransaction.accountId]
            );
        } else if (updatedTransaction.type === 'expense') {
            const account = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [updatedTransaction.accountId])[0];
            const newBalance = account.balance - updatedTransaction.amount;
            db.runSync(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [newBalance, updatedTransaction.accountId]
            );
        } else if (updatedTransaction.type === 'transfer') {
            const sourceAccount = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [updatedTransaction.accountId])[0];
            const targetAccount = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [updatedTransaction.targetAccountId])[0];

            const totalDeduction = updatedTransaction.amount + (updatedTransaction.fee || 0);
            const newSourceBalance = sourceAccount.balance - totalDeduction;
            const newTargetBalance = targetAccount.balance + updatedTransaction.amount;

            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [newSourceBalance, updatedTransaction.accountId]);
            db.runSync('UPDATE accounts SET balance = ? WHERE id = ?', [newTargetBalance, updatedTransaction.targetAccountId]);


            const oldFee = db.getAllSync(
                `SELECT * FROM ${TRANSACTION_TABLE_NAME} WHERE 1=1 AND title = ? AND createdAt = ? AND accountId = ?`,
                ['Biaya transfer', Number(oldTx.createdAt) + 1, oldTx.accountId]
            )[0];
            console.log(oldFee);

            if (updatedTransaction.fee && updatedTransaction.fee > 0) {
                db.runSync(`UPDATE ${TRANSACTION_TABLE_NAME} SET amount = ?, accountId = ?, targetAccountId = ?, createdAt = ? WHERE id = ? `, [
                    updatedTransaction.fee,
                    updatedTransaction.accountId,
                    updatedTransaction.targetAccountId,
                    updatedTransaction.createdAt + 1,
                    oldFee.id
                ]);

                updateBalanceHistory(oldFee.id, {
                    change: -updatedTransaction.fee,
                });

            }

            db.execSync('COMMIT;');
            return;
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
        const existing = db.getAllSync(`SELECT * FROM ${TRANSACTION_TABLE_NAME} WHERE id = ?`, [id]);
        if (existing.length === 0) throw new Error('Transaksi tidak ditemukan');
        const tx = existing[0];

        // Rollback efek saldo
        if (tx.type === 'income') {
            db.runSync(`UPDATE ${ACCOUNT_TABLE_NAME} SET balance = balance - ? WHERE id = ?`, [tx.amount, tx.accountId]);
        } else if (tx.type === 'expense') {
            db.runSync(`UPDATE ${ACCOUNT_TABLE_NAME} SET balance = balance + ? WHERE id = ?`, [tx.amount, tx.accountId]);
        } else if (tx.type === 'transfer') {
            const totalDeduction = tx.amount + (tx.fee || 0);
            // Kembalikan saldo akun asal
            db.runSync(`UPDATE ${ACCOUNT_TABLE_NAME} SET balance = balance + ? WHERE id = ?`, [totalDeduction, tx.accountId]);
            // Kurangi saldo akun tujuan
            db.runSync(`UPDATE ${ACCOUNT_TABLE_NAME} SET balance = balance - ? WHERE id = ?`, [tx.amount, tx.targetAccountId]);

            // Cek dan hapus fee transfer jika ada
            db.runSync(
                `DELETE FROM ${TRANSACTION_TABLE_NAME} 
                WHERE title = 'Biaya transfer' 
                AND createdAt = ? 
                AND accountId = ?
                AND targetAccountId = ?`,
                [Number(tx.createdAt) + 1, tx.accountId, tx.targetAccountId]
            );
        }

        // Hapus transaksi utama
        db.runSync(`DELETE FROM ${TRANSACTION_TABLE_NAME} WHERE id = ?`, [id]);


        db.execSync('COMMIT;');
    } catch (e) {
        db.execSync('ROLLBACK;');
        console.error('Gagal menghapus transaksi:', e.message);
        throw e;
    }
};

export const filterTransactions = (query = {}) => {
    try {
        // Base query
        let sql = `SELECT * FROM ${TRANSACTION_TABLE_NAME} WHERE 1=1`;
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

        if (query.hasImage === true) {
            sql += ` AND img IS NOT NULL AND img != ''`;
        }

        // Sorting default: terbaru dulu
        sql += ` ORDER BY createdAt DESC`;

        // Limit and optional offset
        if (query.limit !== undefined) {
            sql += ` LIMIT ?`;
            params.push(query.limit);

            if (query.offset !== undefined) {
                sql += ` OFFSET ?`;
                params.push(query.offset);
            }
        }

        return db.getAllSync(sql, params);
    } catch (e) {
        console.error('Gagal memfilter transaksi:', e.message);
        throw e;
    }
};

