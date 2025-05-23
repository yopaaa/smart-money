import { createContext, useContext, useEffect, useState } from 'react';
import {
    addAccount,
    addTransaction,
    editTransaction,
    getAccounts,
    getTransactions,
    initDB,
    resetTables
} from '../utils/db';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);

    const refetchTransactions = () => {
        console.log("Refetching...");
        fetchTransactions()
    };

    const fetchTransactions = () => {
        const txs = getTransactions();
        setTransactions(txs);
        // console.log(txs);
        loadAccounts()
    };

    const loadAccounts = () => {
        const rows = getAccounts();
        setAccounts(rows);
    };

    useEffect(() => {
        initDB()
        loadAccounts()
        fetchTransactions();
    }, []);

    return (
        <TransactionContext.Provider value={{
            transactions, accounts,
            refetchTransactions, resetTables, getAccounts, addTransaction, addAccount, editTransaction
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionProvider
export const useTransactions = () => useContext(TransactionContext);
