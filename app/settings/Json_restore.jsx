import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import transactions from '../../doc/result-formated.json';
import accounts from '../../doc/update-account.json';
import { useTransactions } from '../TransactionContext';

const MyWebViewScreen = () => {
    const { filterTransactions, addAccount, resetTables, addTransaction } = useTransactions();

    function name(params) {

        resetTables()
        accounts.map(val => {
            addAccount(val)
        })
    }

    function transaksi(params) {


        transactions.map(val => {
            addTransaction(
                {
                    title: val.title,
                    description: val.description,
                    amount: Number(val.amount),
                    type: val.type,
                    accountId: val.accountId,
                    targetAccountId: val.targetAccountId,
                    createdAt: Number(val.createdAt),
                    category: val.category,
                    fee: Number(val.fee)
                }
            )
        })
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={name} style={styles.btn}>
                <Text>Account</Text>

            </TouchableOpacity>

            <TouchableOpacity onPress={transaksi} style={styles.btn}>
                <Text>Transaksi</Text>

            </TouchableOpacity>
        </View>
    );
};

export default MyWebViewScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10
    }, btn: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 10,
        padding: 15
    }
});
