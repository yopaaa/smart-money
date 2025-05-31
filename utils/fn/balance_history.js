import { db } from '../db';
import generateId from '../generateId';

// 🔽 CREATE
export const logBalanceHistory = ({
    accountId,
    balance,
    change = null,
    source = null,
    referenceId = null,
    note = null,
    createdAt = Date.now(),
}) => {
    const id = generateId();
    db.runSync(`
        INSERT INTO account_balance_history 
        (id, accountId, balance, change, source, referenceId, note, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, accountId, balance, change, source, referenceId, note, createdAt]);
    return id;
};

// 🔽 READ ALL
export const getBalanceHistory = () => {
    return db.getAllSync('SELECT * FROM account_balance_history ORDER BY createdAt DESC');
};

// 🔽 READ BY ID
export const getBalanceHistoryById = (id) => {
    const rows = db.getAllSync('SELECT * FROM account_balance_history WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

// 🔽 READ BY ACCOUNT
export const getBalanceHistoryByAccount = (accountId) => {
    return db.getAllSync('SELECT * FROM account_balance_history WHERE accountId = ? ORDER BY createdAt DESC', [accountId]);
};

// 🔽 UPDATE
export const updateBalanceHistory = (id, updatedData) => {
    const existing = getBalanceHistoryById(id);
    if (!existing) throw new Error('Data tidak ditemukan');

    const {
        balance = existing.balance,
        change = existing.change,
        source = existing.source,
        referenceId = existing.referenceId,
        note = existing.note,
        createdAt = existing.createdAt
    } = updatedData;

    db.runSync(`
        UPDATE account_balance_history SET 
            balance = ?, change = ?, source = ?, referenceId = ?, note = ?, createdAt = ?
        WHERE id = ?
    `, [balance, change, source, referenceId, note, createdAt, id]);
};

// 🔽 DELETE
export const deleteBalanceHistory = (id) => {
    db.runSync('DELETE FROM account_balance_history WHERE referenceId = ?', [id]);
};
