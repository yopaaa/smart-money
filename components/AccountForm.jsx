import { useState } from 'react';
import { Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { getAccounts, insertAccount } from '../utils/db';

function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


const AccountForm = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('cash');
  const [isLiability, setIsLiability] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handleSubmit = () => {
    if (!name || isNaN(balance)) {
      alert('Nama dan saldo wajib diisi dengan benar.');
      return;
    }

    const newAccount = {
      id: generateId(),
      name,
      balance: parseInt(balance),
      type,
      isLiability,
      hidden,
    };

    insertAccount(newAccount);
    const updatedAccounts = getAccounts();
    onSuccess(updatedAccounts);

    // reset form
    setName('');
    setBalance('');
    setType('cash');
    setIsLiability(false);
    setHidden(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nama Akun</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Contoh: Dompet, Bank BCA"
      />

      <Text style={styles.label}>Saldo Awal</Text>
      <TextInput
        style={styles.input}
        value={balance}
        onChangeText={setBalance}
        keyboardType="numeric"
        placeholder="100000"
      />

      <Text style={styles.label}>Tipe Akun</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="cash / debit / saving / invest"
      />

      <View style={styles.switchRow}>
        <Text>Liabilitas?</Text>
        <Switch value={isLiability} onValueChange={setIsLiability} />
      </View>

      <View style={styles.switchRow}>
        <Text>Sembunyikan dari perhitungan?</Text>
        <Switch value={hidden} onValueChange={setHidden} />
      </View>

      <Button title="Tambah Akun" onPress={handleSubmit} />
    </View>
  );
};

export default AccountForm;

const styles = StyleSheet.create({
  container: {
    // position: "absolute",
    gap: 10,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 20
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
});
