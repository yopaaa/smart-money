import { formatCurrency, reloadCurrencySetting, unformatCurrency } from '@/utils/number';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../TransactionContext';
import { useData } from './NewAccountProvider';

export default function AddAccountScreen() {
  const { addAccount, saveSetting } = useTransactions();
  const { formData, handleChange } = useData()
  const [balance, setAccountName] = useState('');
  const router = useRouter();

  const handleNameChange = (text) => {
    handleChange("balance", unformatCurrency(text, formData.currency))
    setAccountName(unformatCurrency(text, formData.currency));
  };

  const handleNext = () => {
    handleSubmit()
    router.push("/Success")
  };

  const handleSubmit = () => {
    const accountData = {
      name: formData.name.trim(),
      balance: formData.balance,
      type: "cash",
      isLiability: 0,
      hidden: 0,
      icon: "cash",
      iconColor: "#81c784",
      description: "Initial Bucket"
    }
    saveSetting("currency", formData.currency)
    try {
      addAccount(accountData)
      reloadCurrencySetting()
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Initial Balance</Text>
          <Text style={styles.subtitle}>Choose a initial balance for new bucket.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Balance</Text>
          <TextInput
            value={formatCurrency(balance, formData.currency)}
            inputMode='numeric'
            onChangeText={handleNameChange}
            placeholder="100.000"
            placeholderTextColor="#A0A0A0"
            style={styles.input}
          />

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={!balance}
            style={[
              styles.button,
              balance ? styles.buttonEnabled : styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    marginTop: 50,
    // justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#3B82F6',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  keyboard: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderTopColor: '#DDD',
    borderTopWidth: 1,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  key: {
    flex: 1,
    marginHorizontal: 2,
    backgroundColor: '#DDD',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  keyText: {
    fontSize: 18,
    color: '#000',
  },
  keySub: {
    position: 'absolute',
    right: 6,
    top: 2,
    fontSize: 10,
    color: '#666',
  },
});
