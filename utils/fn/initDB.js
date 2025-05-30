import { db } from '../db';


import defaultCategories from '../defaultCategories.json';
import { addCategory } from './category';

export const ACCOUNT_TABLE_NAME = "accounts";
export const TRANSACTION_TABLE_NAME = "transactions";
export const CATEGORIES_TABLE_NAME = "categories";

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
    description TEXT
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

    const existing = db.getAllSync(`SELECT COUNT(*) as total FROM ${CATEGORIES_TABLE_NAME}`);
    if (existing[0]?.total === 0) {
        defaultCategories.map(val => {
            console.log('⏳ Menambahkan category default...');
            addCategory(val)
        })
    }
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