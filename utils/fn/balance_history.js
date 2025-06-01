import { db } from '../db';
import generateId from '../generateId';

// 🔽 CREATE
export const logBalanceHistory = ({
    accountId,
    change = null,
    source = null,
    referenceId = null,
    note = null,
    createdAt = Date.now(),
}) => {
    const id = generateId();
    db.runSync(`
        INSERT INTO account_balance_history 
        (id, accountId, change, source, referenceId, note, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, accountId, change, source, referenceId, note, createdAt]);
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

export const getBalanceHistoryByReferenceId = (id) => {
    const rows = db.getAllSync(
        "SELECT * FROM account_balance_history WHERE referenceId = ? ",
        [id]
    );
    return rows.length ? rows[0] : null;
};

// 🔽 READ WITH FILTER
export const getBalanceHistoryWithFilter = ({
    accountId = null,
    source = null,
    referenceId = null,
    startDate = null,
    endDate = null,
    limit = null,
    offset = null,
} = {}) => {
    const conditions = [];
    const params = [];

    if (accountId !== null) {
        conditions.push('accountId = ?');
        params.push(accountId);
    }

    if (source !== null) {
        conditions.push('source = ?');
        params.push(source);
    }

    if (referenceId !== null) {
        conditions.push('referenceId = ?');
        params.push(referenceId);
    }

    if (startDate !== null) {
        conditions.push('createdAt >= ?');
        params.push(startDate);
    }

    if (endDate !== null) {
        conditions.push('createdAt <= ?');
        params.push(endDate);
    }

    let query = 'SELECT * FROM account_balance_history';

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY createdAt DESC';

    if (limit !== null) {
        query += ' LIMIT ?';
        params.push(limit);
    }

    if (offset !== null) {
        query += ' OFFSET ?';
        params.push(offset);
    }

    return db.getAllSync(query, params);
};


// 🔽 UPDATE
export const updateBalanceHistory = (ReferenceId, updatedData) => {
    const existing = getBalanceHistoryByReferenceId(ReferenceId);
    if (!existing) throw new Error('Data tidak ditemukan');

    const {
        change = existing.change,
        source = existing.source,
        referenceId = existing.referenceId,
        note = existing.note,
        createdAt = existing.createdAt
    } = updatedData;

    db.runSync(`
        UPDATE account_balance_history SET 
            change = ?, source = ?, referenceId = ?, note = ?, createdAt = ?
        WHERE ReferenceId = ?
    `, [change, source, referenceId, note, createdAt, ReferenceId]);
};

// 🔽 DELETE
export const deleteBalanceHistory = (id) => {
    db.runSync('DELETE FROM account_balance_history WHERE referenceId = ?', [id]);
};
