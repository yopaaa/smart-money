import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Button,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { parseTransaction } from '../../../utils/parser';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem('transactions');
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Gagal load transaksi:", err);
    }
  };

  const saveTransactions = async (newList) => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(newList));
    } catch (err) {
      console.error("Gagal simpan transaksi:", err);
    }
  };

  const handleAddTransaction = () => {
    if (!input.trim()) return;
    const parsed = parseTransaction(input);
    const newList = [parsed, ...transactions];
    setTransactions(newList);
    saveTransactions(newList);
    setInput('');
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.timestamp);
    const formatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    return (
      <View style={styles.item}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.amount}>{item.amount}</Text>
        <Text style={styles.note}>{item.raw}</Text>
        <Text style={styles.date}>{formatted}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Riwayat Transaksi</Text>

      <View style={styles.inputSection}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Contoh: dinner 50"
          style={styles.input}
        />
        <Button title="Tambah" onPress={handleAddTransaction} />
      </View>

      {transactions.length === 0 ? (
        <Text style={styles.empty}>Belum ada transaksi.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.timestamp.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10
  },
  item: {
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 10
  },
  category: { fontWeight: 'bold', fontSize: 16 },
  amount: { fontSize: 16, color: '#1a8917' },
  note: { fontStyle: 'italic', color: '#555' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
  empty: { textAlign: 'center', color: '#777', marginTop: 50 }
});
