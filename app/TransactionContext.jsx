import { createContext, useContext, useEffect, useState } from 'react';
import {
    addAccount,
    addTransaction,
    deleteTransaction,
    editTransaction,
    filterTransactions,
    getAccounts,
    getTransactionById,
    getTransactions,
    initDB,
    resetTables
} from '../utils/db';

const TransactionContext = createContext();
initDB()

export const TransactionProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);

    const refetchData = () => {
        console.log("Refetching...");

        loadAccounts()
    };

    const loadAccounts = () => {
        const rows = getAccounts();
        // console.log(rows);
        setAccounts(rows);
    };

    useEffect(() => {
        initDB()
        loadAccounts()
        refetchData();
        // console.log(getTransactions());
    }, []);

    return (
        <TransactionContext.Provider value={{
            accounts,
            initDB,
            refetchData,
            resetTables,
            getAccounts,
            addTransaction,
            addAccount,
            editTransaction,
            deleteTransaction,
            filterTransactions,
            getTransactionById,
            getTransactions
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionProvider
export const useTransactions = () => useContext(TransactionContext);
