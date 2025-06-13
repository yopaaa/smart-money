import { createContext, useContext, useEffect, useState } from 'react';
import {
    addAccount,
    deleteAccount,
    editAccount,
    getAccountById,
    getAccounts
} from '../utils/fn/account';
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
import { groupAccounts } from './(home)/Account';
const TransactionContext = createContext();
initDB()

export const TransactionProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [accountsGrouped, setAccountsGrouped] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isNewUser, setIsNewUser] = useState(false);

    const refetchData = () => {
        console.log("Refetching...");

        loadAccounts()
    };

    const loadAccounts = async () => {
        initDB()

        const rows = getAccounts();
        const categoryRow = getAllCategories();
        // console.log(rows);
        // setAccounts(rows);
        setCategories(categoryRow)
        
       // console.log(rows.length);
        
        rows.length == 0 ? setIsNewUser(true) :  setIsNewUser(false)

        const latestGrouped = await groupAccounts(rows)
        const accountSorted = []
        latestGrouped.map(val => {
            val.data.map(val => accountSorted.push(val))
        })
        setAccounts(accountSorted)
        setAccountsGrouped(latestGrouped)
    };

    useEffect(() => {
        initDB()
        loadAccounts()
        refetchData();
    }, []);

    return (
        <TransactionContext.Provider value={{
            accounts,
            accountsGrouped,
            isNewUser,
            initDB,
            refetchData,
            resetTables,
            getAccounts,
            addAccount,
            deleteAccount,
            getAccountById,
            editAccount,
            addTransaction,
            editTransaction,
            deleteTransaction,
            filterTransactions,
            getTransactionById,
            getTransactions,
            categories,
            getCategoryById,
            getCategoriesByType,
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionProvider
export const useTransactions = () => useContext(TransactionContext);
