import colorOptions from '@/app/json/colorOptions.json';
import groupLabels from '@/app/json/groupLabels.json';
import iconOptions from '@/app/json/iconOptions.json';
import CustomIconPickerGrid from '@/components/CustomIconPickerGrid';
import CustomPicker from '@/components/CustomPicker';
import SimpleHeader from '@/components/SimpleHeader';
import SwitchToggle from '@/components/SwitchToggle';
import { useTransactions } from '@/hooks/TransactionContext';
import { formatCurrency, unformatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

const EditAccountForm = () => {
  const { id } = useLocalSearchParams();
  const router = useNavigation();
  const { getAccountById, editAccount, refetchData } = useTransactions();

  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
  const [selectedIconColor, setSelectedIconColor] = useState(colorOptions[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    balance: 0,
    type: groupLabels[0],
    description: ''
  });

  useEffect(() => {
    const account = getAccountById(id);
    console.log(account);
    
    if (account) {
      const selectedGroup = groupLabels.find(g => g.key === account.type) || groupLabels[0];
      const selectedIcon = iconOptions.find(i => i.icon === account.icon) || iconOptions[0];
      const selectedColor = colorOptions.find(c => c.color === account.iconColor) || colorOptions[0];
      setFormData({
        name: account.name,
        balance: account.balance,
        type: selectedGroup,
        description: account.description || ''
      });
      setSelectedIcon(selectedIcon);
      setSelectedIconColor(selectedColor);
      account.hidden == 0 ? setIsVisible(true) : setIsVisible(false)      
    }
  }, [id]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || isNaN(formData.balance)) {
      Alert.alert('Error', 'Mohon isi semua data dengan benar');
      return;
    }

    const updatedAccount = {
      name: formData.name.trim(),
      balance: formData.balance,
      type: formData.type.key,
      isLiability: formData.type.isLiability ? 1 : 0,
      hidden: isVisible ? 0 : 1,
      icon: selectedIcon.icon,
      iconColor: selectedIconColor.color,
      description: formData.description.trim()
    };

    try {
      await editAccount(id, updatedAccount);
      refetchData();
      Alert.alert('Sukses', 'Akun berhasil diperbarui');
      router.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: StatusBar.currentHeight || 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SimpleHeader title="Edit Akun" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nama Akun</Text>
            <TextInput
              style={styles.input}
              placeholder="Tabungan, Bank dll"
              value={formData.name}
              onChangeText={text => handleChange('name', text)}
              autoFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Jumlah</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="100.000"
              value={formatCurrency(formData.balance)}
              onChangeText={text => handleChange('balance', unformatCurrency(text))}
            />
          </View>

          <CustomPicker
            inputContainerStyle={styles.inputContainer}
            labelStyle={styles.label}
            pickerStyle={styles.picker}
            label="Kategori"
            selected={formData.type}
            onSelect={(val, index) => {
              handleChange('type', val);
              setSelectedIcon(iconOptions[index]);
              setSelectedIconColor(colorOptions[index]);
            }}
            options={groupLabels}
            selectedComponent={(val) => (
              <>
                <MaterialCommunityIcons name={selectedIcon.icon} size={30} style={{ marginRight: 10 }} color={selectedIconColor.color} />
                <Text>{val.name}</Text>
              </>
            )}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', margin: 15 }}>
            <CustomIconPickerGrid
              pickerStyle={{ height: 80, justifyContent: 'space-around', width: 150 }}
              label="Pilih Ikon"
              selectedIcon={selectedIcon}
              onSelect={setSelectedIcon}
              options={iconOptions}
              iconColor={selectedIconColor.color}
            />
            <CustomIconPickerGrid
              pickerStyle={{ height: 80, justifyContent: 'space-around', width: 150 }}
              label="Pilih Warna"
              selectedIcon={selectedIconColor}
              onSelect={setSelectedIconColor}
              options={colorOptions}
            />
          </View>

          <View style={{ ...styles.inputContainer, paddingVertical: 15 }}>
            <Text style={{ ...styles.label, width: '80%', marginTop: 0 }}>Tampilkan Saldo Akun Ini ke Total</Text>
            <SwitchToggle
              value={isVisible}
              onValueChange={setIsVisible}
              activeColor="#34C759"
              inactiveColor="#E5E5EA"
              thumbColor="white"
              size="medium"
            />
          </View>

          

          <Text style={{ ...styles.label, padding: 10 }}>Deskripsi</Text>
          <TextInput
            style={[styles.input, { height: 80, width: '100%' }]}
            placeholder="Tambahkan deskripsi (opsional)"
            multiline
            value={formData.description}
            onChangeText={text => handleChange('description', text)}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Simpan Perubahan"
              onPress={handleSubmit}
              color="#007AFF"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },

  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff'
  },
  saveButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  saveText: {
    color: '#007AFF',
    fontWeight: 'bold'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15
  },
  tab: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  activeTab: {
    backgroundColor: '#E0F0FF',
    borderColor: '#007AFF'
  },
  tabText: {
    color: '#333',
    textTransform: 'capitalize'
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold'
  },
  scrollContainer: {
    paddingBottom: 32
  },
  formContainer: {
    paddingHorizontal: 8
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  label: {
    width: 120,
    marginTop: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: "space-evenly",
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    fontSize: 16,
    // width: 250,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: 250,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default EditAccountForm;
