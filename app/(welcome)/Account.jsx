import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddAccountScreen() {
  const [accountName, setAccountName] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const router = useRouter();

  const handleNameChange = (text) => {
    setAccountName(text);
  };

  const handleNext = () => {
    if (accountName.trim()) {
      console.log('Account name:', accountName);
      // Lanjutkan ke langkah berikutnya
      router.push("/Currency")
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
          <Text style={styles.title}>Add Account</Text>
          <Text style={styles.subtitle}>Choose a name for your account.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={accountName}
            onChangeText={handleNameChange}
            placeholder="Enter account name"
            placeholderTextColor="#A0A0A0"
            style={styles.input}
          />

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={!accountName.trim()}
            style={[
              styles.button,
              accountName.trim() ? styles.buttonEnabled : styles.buttonDisabled,
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
    backgroundColor: '#2563EB',
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
