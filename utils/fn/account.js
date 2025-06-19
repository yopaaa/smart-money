import { db } from '../db';
import generateId from '../generateId';
import { addTransaction } from './transaction';

import groupLabels from '../../app/json/groupLabels.json';
import { getSetting, saveSetting } from './settings';
// Map dari type ke metadata grup

const addAccountToSavedOrder = async (newAccount) => {
    try {
        const saved = getSetting("@modified_account_order");        
        let savedOrder = saved ? saved : [];

        const type = newAccount.type || 'other';
        const meta = groupLabels.find(val => val.key == type)

        let groupIndex = savedOrder.findIndex(group => group.title === meta.name);

        if (groupIndex >= 0) {
            // Grup sudah ada, tambahkan akun ke data[]
            savedOrder[groupIndex].data.push(newAccount);
        } else {
            // Grup belum ada, buat baru
            const newGroup = {
                title: meta.title,
                icon: meta.icon,
                color: meta.color,
                balance: 0,
                data: [newAccount],
            };
            savedOrder.push(newGroup);
        }

        saveSetting("@modified_account_order", savedOrder)
        console.log('✅ Akun ditambahkan ke saved order');
    } catch (e) {
        console.error('❌ Gagal menambahkan akun ke saved order:', e);
    }
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
    const newData = getAccountById(id)
    addAccountToSavedOrder(newData)
};

export const getAccounts = () => {
    const result = db.getAllSync('SELECT * FROM accounts');
    return result; // langsung return array of rows
};

export const getAccountById = (id) => {
    try {
        const result = db.getAllSync('SELECT * FROM accounts WHERE id = ?', [id]);
        return result.length > 0 ? result[0] : null;
    } catch (e) {
        console.error('Gagal mengambil akun:', e.message);
        throw e;
    }
};

export const editAccount = (id, updatedAccount) => {
    try {
        // Ambil data lama
        const existing = getAccountById(id);

        const updated = {
            ...existing,
            ...updatedAccount
        };

        db.runSync(`
            UPDATE accounts SET 
                name = ?, 
                type = ?, 
                isLiability = ?, 
                hidden = ?, 
                icon = ?, 
                iconColor = ?, 
                description = ?
            WHERE id = ?;
        `, [
            updated.name,
            updated.type,
            updated.isLiability ? 1 : 0,
            updated.hidden ? 1 : 0,
            updated.icon || 'wallet',
            updated.iconColor || '#4caf50',
            updated.description || '',
            id
        ]);
    } catch (e) {
        console.error('Gagal mengedit akun:', e.message);
        throw e;
    }
};



export const deleteAccount = (id) => {
    try {
        db.execSync('BEGIN TRANSACTION;');

        // Hapus semua transaksi terkait akun ini
        // db.runSync('DELETE FROM transactions WHERE accountId = ? OR targetAccountId = ?', [id, id]);

        // db.runSync('DELETE FROM account_balance_history WHERE accountId = ?', [id]);

        // Hapus akun
        db.runSync('DELETE FROM accounts WHERE id = ?', [id]);

        db.execSync('COMMIT;');
    } catch (e) {
        db.execSync('ROLLBACK;');
        console.error('Gagal menghapus akun:', e.message);
        throw e;
    }
};


