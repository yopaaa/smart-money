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
import { getSetting, saveSetting } from '../utils/fn/settings';
import {
    addTransaction,
    deleteTransaction,
    editTransaction,
    filterTransactions,
    getTransactionById,
    getTransactions,
} from '../utils/fn/transaction';
import groupLabels from './json/groupLabels.json';

const TransactionContext = createContext();
initDB()

export const TransactionProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [accountsGrouped, setAccountsGrouped] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isNewUser, setIsNewUser] = useState(false);

    const groupAccounts = async (accounts) => {
        try {
            const groups = {};

            for (let acc of accounts) {
                const key = acc.type || 'other';

                if (!groups[key]) {
                    groups[key] = {
                        balance: 0,
                        accounts: []
                    };
                }

                groups[key].accounts.push(acc);
                if (acc.hidden === 0) {

                    groups[key].balance += acc.balance;
                }
            }

            const latestGrouped = groupLabels
                .filter(group => groups[group.key]) // hanya yang ada datanya
                .map(group => ({
                    title: group.name,
                    icon: group.icon,
                    color: group.color,
                    balance: groups[group.key].balance,
                    data: groups[group.key].accounts
                }));


            let savedData = getSetting("@modified_account_order");

            if (!savedData) {
                saveSetting("@modified_account_order", latestGrouped)
                savedData = getSetting("@modified_account_order");
            }

            if (savedData) {
                const savedOrder = savedData;

                const groupMap = {};
                for (let group of latestGrouped) {
                    groupMap[group.title] = group;
                }

                const ordered = [];

                for (let savedGroup of savedOrder) {
                    const latestGroup = groupMap[savedGroup.title];

                    if (latestGroup) {
                        const accountMap = {};
                        for (let acc of latestGroup.data) {
                            accountMap[acc.id] = acc;
                        }

                        const orderedAccounts = [];

                        for (let savedAcc of savedGroup.data) {
                            const acc = accountMap[savedAcc.id];
                            if (acc) {
                                orderedAccounts.push(acc);
                                delete accountMap[savedAcc.id];
                            }
                        }

                        const newAccounts = Object.values(accountMap);
                        const finalAccounts = [...orderedAccounts, ...newAccounts];

                        ordered.push({
                            ...latestGroup,
                            data: finalAccounts,
                        });

                        delete groupMap[savedGroup.title];
                    }
                }

                const newGroups = Object.values(groupMap);
                const finalGrouped = [...ordered, ...newGroups];

                return finalGrouped
            } else {
                return latestGrouped
            }
        } catch (e) {
            console.error('Failed to load saved order:', e);
            throw e
        }
    };

    const refetchData = () => {
        console.log("Refetching...");
        loadAccounts()
    };

    const loadAccounts = async () => {
        initDB()

        const rows = getAccounts();
        const categoryRow = getAllCategories();
        setCategories(categoryRow)

        rows.length == 0 ? setIsNewUser(true) : setIsNewUser(false)

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
            saveSetting,
            getSetting
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionProvider
export const useTransactions = () => useContext(TransactionContext);
