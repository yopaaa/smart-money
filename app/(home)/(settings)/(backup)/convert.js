// const originalData = require("./Transaction.json")
// const akun = require("./update-account.json")

function generateId() {
    return Math.random().toString(36).substring(2, 10) +
        Math.random().toString(36).substring(2, 10);
}

const categoryMap = {
    "1": "54097182", // Uang Saku
    "2": "80317529", // Gaji
    "3": "70932418", // Penarikan Tunai
    "4": "29478136", // Bonus
    "5": "89102743", // Lainnya (income)
    "6": "27451903", // Makanan
    "7": "94638215", // Social Life — tidak ditemukan ID-nya
    "9" : "10387452", // Tranport
    "11": "84970216", // Minuman
    "12": "71563049", // Belanja
    "13": "bd3e-128a6261dc2f", // Beauty — tidak ditemukan
    "14": "32108794", // Kesehatan
    "15": "58762013", // Pendidikan
    "16": "9b197a04fadc", // Gift — tidak ditemukan
    "17": "29680517", // Lainnya (expense)
    "Transfer": "52841730", // Transfer
    "17c32883-7c8a-453d-b20a-d2eb71849455": "10387452", // Transportasi
    "24aba629-0e16-49f0-88e8-9479188a01e6": "94638215", // Hiburan
    "e92127db-3ce9-4284-9246-9d3e7d769616": "63217845", // Tagihan
    "9147ca88-6f58-45bb-8000-53fe6e6f6a32": "96740128", // Donasi
    "1c120eae-ebdb-41ab-aa84-97d0dc1620a6": "98f6-5db647f18a0a", // Transfer Keluar
    "6d484f15-f861-4db4-b136-5125319f9a5d": "63217845", // Biaya Admin
    "57cba5f8-6062-41f6-ba59-9f2599b1d193": "9fd2a1a78d42", // Handy — tidak ditemukan
};



export function convertTransactions(originalData, akun) {
    // Map assetUid to accountId

    // Helper function to determine transaction type
    function getTransactionType(doType, amount) {
        if (doType === "3") return "transfer_in";
        if (doType === "4") return "transfer_out";
        return doType == "0" ? "income" : "expense";
    }

    // Helper function to get proper title
    function getTitle(item) {
        if (item.ZCONTENT.toLowerCase().includes('uang awal')) return `Initial balance for ${akun.find(x => x.id == item.assetUid).name}`;
        if (item.ZCONTENT.toLowerCase().includes('transfer')) return `Transfer ${item.toAssetUid ? `to ${akun.find(x => x.id == item.toAssetUid).name || item.toAssetUid}` : ''}`;
        return item.ZCONTENT;
    }

    const result = [];
    const processedIds = new Set();

    originalData.forEach(item => {
        if (processedIds.has(item.uid)) return;

        const amount = parseFloat(item.ZMONEY);
        const isInitialBalance = item.ZCONTENT.toLowerCase().includes('uang awal');
        const isTransfer = item.DO_TYPE === "3" || item.DO_TYPE === "4";
        const hasFee = item.txUidFee && item.txUidFee !== "0";

        // Main transaction
        const transaction = {
            accountId: item.assetUid,
            amount: Math.abs(amount),
            category: isInitialBalance ? "initial-balance" : (isTransfer ? "52841730" : categoryMap[item.ctgUid] || null),
            createdAt: item.ZDATE,
            description: isInitialBalance
                ? `Initial balance setup for account  ${akun.find(x => x.id == item.assetUid).name}`
                : (item.ZDATA || null),
            fee: 0, // We'll handle fees separately
            id: item.uid || generateId(),
            targetAccountId: isTransfer ? item.toAssetUid : null,
            title: getTitle(item),
            type: getTransactionType(item.DO_TYPE, amount),
        };

        result.push(transaction);
        processedIds.add(item.uid);

        // Handle transfer fee if exists
        if (hasFee && isTransfer) {
            // Find the fee transaction in the original data
            const feeItem = originalData.find(t => t.uid === item.txUidFee);
            if (feeItem) {
                const feeTransaction = {
                    accountId: transaction.accountId, // Fee is charged to the source account
                    amount: Math.abs(parseFloat(feeItem.ZMONEY)),
                    category: "Biaya Admin",
                    createdAt: feeItem.ZDATE,
                    description: feeItem.ZDATA || "Biaya transfer ke Rekening Bank",
                    fee: 0,
                    id: feeItem.uid || generateId(),
                    targetAccountId: null,
                    title: "Biaya transfer",
                    type: "expense"
                };

                result.push(feeTransaction);
                processedIds.add(feeItem.uid);

                // Update the main transaction's fee field
                transaction.fee = feeTransaction.amount;
            }
        }
    });

    return result;
}

// Fungsi untuk generate ID random sederhana
function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Fungsi utama untuk mengkonversi transaksi transfer
export function convertTransferFormat(transactions) {
  const convertedTransactions = [];
  const processedTransfers = new Set();

  transactions.forEach(transaction => {
    const { accountId, amount, category, createdAt, description, fee, id, targetAccountId, title, type } = transaction;

    if (type === 'transfer_in' || type === 'transfer_out') {
      // Skip jika transfer ini sudah diproses
      if (processedTransfers.has(createdAt + '-' + amount)) {
        return;
      }

      // Tandai transfer ini sudah diproses
      processedTransfers.add(createdAt + '-' + amount);

      // Cari pasangan transfer (transfer_in atau transfer_out yang sesuai)
      const pairedTransfer = transactions.find(t =>
        t.createdAt === createdAt &&
        t.amount === amount &&
        t.id !== id &&
        (t.type === 'transfer_in' || t.type === 'transfer_out') &&
        t.type !== type
      );

      if (pairedTransfer) {
        // Tentukan akun pengirim dan penerima
        let fromAccountId, toAccountId;
        if (type === 'transfer_out') {
          fromAccountId = accountId;
          toAccountId = targetAccountId || pairedTransfer.accountId;
        } else {
          fromAccountId = pairedTransfer.accountId;
          toAccountId = accountId;
        }

        // Buat transaksi transfer baru (format baru)
        const transferTransaction = {
          accountId: toAccountId,
          amount: amount,
          category: category,
          createdAt: createdAt,
          description: description,
          fee: fee || 0,
          id: generateRandomId(),
          targetAccountId: fromAccountId,
          title: title || "transfer",
          type: "transfer"
        };

        convertedTransactions.push(transferTransaction);

        // Jika ada fee, buat transaksi biaya admin
        if (fee && fee > 0) {
          const feeTransaction = {
            accountId: fromAccountId,
            amount: fee,
            category: "Biaya Admin",
            createdAt: createdAt,
            description: "Biaya transfer ke Rekening Bank",
            fee: 0,
            id: generateRandomId(),
            targetAccountId: toAccountId,
            title: "Biaya transfer",
            type: "expense"
          };

          convertedTransactions.push(feeTransaction);
        }
      }
    } else {
      // Transaksi non-transfer tetap sama
      convertedTransactions.push(transaction);
    }
  });

  return convertedTransactions;
}

export default convertTransferFormat