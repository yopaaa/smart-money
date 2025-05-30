import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import transactions from '../../doc/result-formated.json';
import accounts from '../../doc/update-account.json';
import { useTransactions } from '../TransactionContext';
import { assetGroups, getAssets, getCategory, getTransactions } from './json_restore';

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


            <TouchableOpacity onPress={() => {
                Alert.alert("data",
                    JSON.stringify(getTransactions().slice(0, 5), " ", " ")
                )
            }}
                style={styles.btn}>
                <Text>Get Transaksi </Text>

            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
                Alert.alert("data",
                    JSON.stringify(getCategory().slice(0, 5), " ", " ")
                )
            }}
                style={styles.btn}>
                <Text>Get Category </Text>

            </TouchableOpacity>


            <TouchableOpacity onPress={() => {
                const data = getAssets()
                const newData = data.map(val => {
                    return ({
                        "balance": 0,
                        "description": "",
                        "hidden": 0,
                        "icon": assetGroups[val.groupUid].icon,
                        "iconColor": assetGroups[val.groupUid].color,
                        "id": val.uid,
                        "isLiability": assetGroups[val.groupUid].isLiability ? 1 : 0,
                        "name": val.NIC_NAME,
                        "type": assetGroups[val.groupUid].key
                    })
                })
                Alert.alert("data",
                    JSON.stringify(newData, " ", " ")
                )
                console.log(newData);

            }}
                style={styles.btn}>
                <Text>Get Assets </Text>

            </TouchableOpacity>


        </View >
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
