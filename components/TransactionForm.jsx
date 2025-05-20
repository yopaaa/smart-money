import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { addTransaction, getAccounts } from '../utils/db';

const TransactionForm = ({ onSuccess }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [accountId, setAccountId] = useState('');
    const [targetAccountId, setTargetAccountId] = useState('');
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const accs = getAccounts().filter(acc => !acc.hidden);
        setAccounts(accs);
        if (accs.length > 0) {
            setAccountId(accs[0].id);
            setTargetAccountId(accs[0].id);
        }
    }, []);

    const handleSubmit = () => {
        if (!title.trim() || !amount || isNaN(amount)) {
            Alert.alert('Error', 'Mohon isi semua data dengan benar');
            return;
        }
        if (!accountId) {
            Alert.alert('Error', 'Pilih akun asal');
            return;
        }
        if (type === 'transfer' && accountId === targetAccountId) {
            Alert.alert('Error', 'Akun asal dan tujuan harus berbeda untuk transfer');
            return;
        }

        const transaction = {
            title,
            amount: parseInt(amount),
            type,
            accountId,
            targetAccountId: type === 'transfer' ? targetAccountId : undefined,
            createdAt: moment().toISOString(),
        };

        try {
            addTransaction(transaction);
            Alert.alert('Sukses', 'Transaksi berhasil ditambahkan');
            onSuccess();
            setTitle('');
            setAmount('');
            setType('expense');
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Judul Transaksi</Text>
            <TextInput
                style={styles.input}
                placeholder="Contoh: Dinner, Gaji, Transfer ke Bank"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Jumlah (Rp)</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="100000"
                value={amount}
                onChangeText={setAmount}
            />

            <Text style={styles.label}>Tipe Transaksi</Text>
            <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
                <Picker.Item label="Pengeluaran (Expense)" value="expense" />
                <Picker.Item label="Pemasukan (Income)" value="income" />
                <Picker.Item label="Transfer" value="transfer" />
            </Picker>

            <Text style={styles.label}>Akun Asal</Text>
            <Picker selectedValue={accountId} onValueChange={setAccountId} style={styles.picker}>
                {accounts.map(acc => (
                    <Picker.Item key={acc.id} label={`${acc.name} (Rp ${acc.balance.toLocaleString()})`} value={acc.id} />
                ))}
            </Picker>

            {type === 'transfer' && (
                <>
                    <Text style={styles.label}>Akun Tujuan</Text>
                    <Picker selectedValue={targetAccountId} onValueChange={setTargetAccountId} style={styles.picker}>
                        {accounts
                            .filter(acc => acc.id !== accountId)
                            .map(acc => (
                                <Picker.Item key={acc.id} label={`${acc.name} (Rp ${acc.balance.toLocaleString()})`} value={acc.id} />
                            ))}
                    </Picker>
                </>
            )}

            <Button title="Tambah Transaksi" onPress={handleSubmit} />
        </View>
    );
};

export default TransactionForm;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 10,
    },
    label: {
        marginTop: 12,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginTop: 6,
    },
    picker: {
        marginTop: 6,
    },
});
