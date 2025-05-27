import { createContext, useContext, useEffect, useState } from 'react';
import {
    addAccount,
    addTransaction,
    deleteTransaction,
    editTransaction,
    filterTransactions,
    getAccounts,
    getTransactionById,
    initDB,
    resetTables
} from '../utils/db';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);

    const refetchData = () => {
        console.log("Refetching...");

        loadAccounts()
    };

    const loadAccounts = () => {
        const rows = getAccounts();
        setAccounts(rows);
    };

    useEffect(() => {
        initDB()
        loadAccounts()
        refetchData();
    }, []);

    return (
        <TransactionContext.Provider value={{
            accounts,
            refetchData,
            resetTables,
            getAccounts,
            addTransaction,
            addAccount,
            editTransaction,
            deleteTransaction, filterTransactions, getTransactionById
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionProvider
export const useTransactions = () => useContext(TransactionContext);
