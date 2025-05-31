import { createContext, useContext, useEffect, useState } from 'react';
import {
    addAccount,
    getAccounts
} from '../utils/fn/account';
import { getBalanceHistory } from '../utils/fn/balance_history';
import {
    getAllCategories,
    getCategoriesByType,
    getCategoryById
} from '../utils/fn/category';
import {
    initDB,
    resetTables
} from '../utils/fn/initDB';
import {
    addTransaction,
    deleteTransaction,
    editTransaction,
    filterTransactions,
    getTransactionById,
    getTransactions,
} from '../utils/fn/transaction';
const TransactionContext = createContext();
initDB()

export const TransactionProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);

    const refetchData = () => {
        console.log("Refetching...");
        console.log(JSON.stringify(getBalanceHistory().slice(0,3), " ", " "));

        loadAccounts()
    };

    const loadAccounts = () => {
        initDB()

        const rows = getAccounts();
        const categoryRow = getAllCategories();
        // console.log(rows);
        setAccounts(rows);
        setCategories(categoryRow)
    };

    useEffect(() => {
        initDB()
        loadAccounts()
        refetchData();
    }, []);

    return (
        <TransactionContext.Provider value={{
            accounts,
            initDB,
            refetchData,
            resetTables,
            getAccounts,
            addAccount,
            addTransaction,
            editTransaction,
            deleteTransaction,
            filterTransactions,
            getTransactionById,
            getTransactions,
            categories,
            getCategoryById,
            getCategoriesByType
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionProvider
export const useTransactions = () => useContext(TransactionContext);
