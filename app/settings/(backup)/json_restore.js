import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('money_manager.db');

export const getTransactions = () => {
  return db.getAllSync(`SELECT * FROM INOUTCOME ORDER BY AID DESC`);
};

export const getAssets = () => {
  return db.getAllSync(`SELECT * FROM ASSETS ORDER BY ID DESC`);
};

export const getCategory = () => {
  return db.getAllSync(`SELECT * FROM ZCATEGORY ORDER BY ID DESC`);
};

export const assetGroups = {
  1: {
    key: "other",
    name: "Lainnya",
    icon: "dots-horizontal",
    color: "#90a4ae",
    isLiability: false,
  },
  2: {
    key: "card",
    name: "Credit Card",
    icon: "credit-card",
    color: "#64b5f6",
    isLiability: true,
  },
  3: {
    key: "debit",
    name: "Debit Card",
    icon: "credit-card-outline",
    color: "#7986cb",
    isLiability: false,
  },
  4: {
    key: "saving",
    name: "Saving Account",
    icon: "bank",
    color: "#4db6ac",
    isLiability: false,
  },
  5: {
    key: "debt",
    name: "Hutang",
    icon: "account-cash",
    color: "#f06292",
    isLiability: true,
  },
  6: {
    key: "receivable",
    name: "Piutang",
    icon: "account-arrow-left",
    color: "#9575cd",
    isLiability: false,
  },
  7: {
    key: "other",
    name: "Lainnya",
    icon: "dots-horizontal",
    color: "#90a4ae",
    isLiability: false,
  },
  8: {
    key: "invest",
    name: "Investasi",
    icon: "chart-line",
    color: "#ffb74d",
    isLiability: false,
  },
  9: {
    key: "expense-buffer",
    name: "Emergency Fund",
    icon: "umbrella",
    color: "#ba68c8",
    isLiability: false,
  },
  10: {
    key: "liability",
    name: "Liabilities",
    icon: "file-document",
    color: "#e57373",
    isLiability: true,
  },
  11: {
    key: "cash",
    name: "Cash",
    icon: "cash",
    color: "#81c784",
    isLiability: false,
  }

};