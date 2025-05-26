import ActionButton from '@/components/ActionButton';
import CustomPicker from '@/components/CustomPicker';
import SimpleHeader from '@/components/SimpleHeader';
import { formatCurrency, unformatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTransactions } from '../TransactionContext';
import expenseCategories from '../page/expenseCategories.json';
import incomeCategories from '../page/incomeCategories.json';
import transferCategories from '../page/transferCategories.json';

const TransactionForm = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const {
        refetchTransactions,
        accounts,
        editTransaction,
        transactions,
        deleteTransaction
    } = useTransactions();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isFormEditable, setIsFormEditable] = useState(true);

    const [formData, setFormData] = useState({
        id: "",
        title: '',
        description: '',
        amount: '',
        type: 'expense',
        accountId: '',
        targetAccountId: '',
        category: '',
        fee: '0',
    });

    useEffect(() => {
        if (id && transactions.length > 0) {
            const tx = transactions.find(t => t.id === id);

            if (tx) {
                const txDate = new Date(parseInt(tx.createdAt));
                const categories =
                    tx.type === 'transfer'
                        ? transferCategories
                        : tx.type === 'income'
                            ? incomeCategories
                            : expenseCategories;

                let matchedCategory
                if (tx.category == "initial-balance" || !tx.category) {
                    matchedCategory = { "color": "#a1887f", "icon": "bank-transfer-in", "name": "initial-balance" }
                } else {
                    matchedCategory = categories.find(cat => cat.name.toLowerCase() === tx.category.toLowerCase());
                }

                setIsFormEditable(tx.category == "Biaya Admin" ? false : true)

                setFormData({
                    id: tx.id,
                    title: tx.title,
                    description: tx.description || "",
                    amount: tx.amount,
                    type: tx.type,
                    accountId: accounts.find(acc => acc.id === tx.accountId) || accounts[0],
                    targetAccountId: accounts.find(acc => acc.id === tx.targetAccountId) || "",
                    category: matchedCategory,
                    fee: tx.fee
                });

                setSelectedDate(txDate);
                setSelectedTime(txDate);
            }
        } else {
            router.back();
        }

    }, [accounts, transactions]);


    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = () => {
        if (!formData.title.trim() || !formData.amount || isNaN(formData.amount)) {
            Alert.alert('Error', 'Mohon isi semua data dengan benar');
            return;
        }
        if (!formData.accountId) {
            Alert.alert('Error', 'Pilih akun asal');
            return;
        }
        if (formData.type === 'transfer' && formData.accountId === formData.targetAccountId) {
            Alert.alert('Error', 'Akun asal dan tujuan harus berbeda untuk transfer');
            return;
        }

        const mergedDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            selectedTime.getHours(),
            selectedTime.getMinutes()
        );


        const transaction = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            amount: parseInt(formData.amount),
            type: formData.type,
            accountId: formData.accountId.id,
            targetAccountId: formData.type === 'transfer' ? formData.targetAccountId.id : undefined,
            createdAt: mergedDate.getTime(),
            category: formData.type === 'transfer' ? "Transfer" : formData.category.name,
            fee: formData.type === 'transfer' ? parseInt(formData.fee || '0') : 0
        };

        try {
            editTransaction(formData.id, transaction)
            Alert.alert('Sukses', 'Transaksi berhasil diperbarui');
            refetchTransactions();


            router.back();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    const handleDelete = () => {
        try {
            deleteTransaction(formData.id)
            Alert.alert('Sukses', 'Transaksi berhasil dihapus');
            refetchTransactions();


            router.back();
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    }
    const handleCopy = () => { }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, paddingTop: StatusBar.currentHeight || 0 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SimpleHeader title={formData.type + " Details"} />

            <View style={styles.tabContainer}>
                {['income', 'expense', 'transfer'].map(type => (
                    <Pressable
                        key={type}
                        style={[styles.tab, formData.type === type && styles.activeTab]}
                    // onPress={() => handleChange('type', type)}
                    >
                        <Text style={[styles.tabText, formData.type === type && styles.activeTabText]}>
                            {type}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>

                    {/* Input date */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date</Text>
                        <View style={styles.input}>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <Text style={{ fontWeight: '800' }}>{selectedDate.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                <Text style={{ fontWeight: '800' }}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) setSelectedDate(date);
                                }}
                            />
                        )}


                        {showTimePicker && (
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                display="default"
                                onChange={(event, time) => {
                                    setShowTimePicker(false);
                                    if (time) setSelectedTime(time);
                                }}
                            />
                        )}
                    </View>

                    {/* Input Title */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Judul Transaksi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Dinner, Gaji or Transfer"
                            value={formData.title}
                            onChangeText={(text) => handleChange('title', text)}
                            editable={isFormEditable}
                        />
                    </View>

                    {/* Input Amount */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Jumlah (Rp)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="100000"
                            value={formatCurrency(formData.amount)}
                            onChangeText={(text) => handleChange('amount', unformatCurrency(text))}
                            editable={isFormEditable}
                        />
                    </View>

                    {/* Input Category */}
                    {formData.type != 'transfer' && (
                        <CustomPicker
                            inputContainerStyle={styles.inputContainer}
                            labelStyle={styles.label}
                            pickerStyle={styles.picker}
                            label="Kategori"
                            selected={formData.category}
                            onSelect={(val) => handleChange('category', val)}
                            options={formData.type === "income" ? incomeCategories : expenseCategories}
                            selectedComponent={(val) => {
                                return (<>
                                    <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.color} />
                                    <Text>{val.name}</Text>
                                </>)
                            }}
                        />
                    )}


                    <CustomPicker
                        inputContainerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                        pickerStyle={styles.picker}
                        label="Akun Sumber"
                        selected={formData.accountId}
                        onSelect={(val) => handleChange('accountId', val)}
                        options={accounts}
                        selectedComponent={(val) => {
                            return (<>
                                <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.iconColor} />
                                <Text>{`${val.name} ( ${formatCurrency(val.balance)})`}</Text>
                            </>)
                        }}
                    />

                    {/* Transfer Form */}
                    {formData.type === 'transfer' && (
                        <>
                            <CustomPicker
                                inputContainerStyle={styles.inputContainer}
                                labelStyle={styles.label}
                                pickerStyle={styles.picker}
                                label="Akun Tujuan"
                                selected={formData.targetAccountId}
                                onSelect={(val) => handleChange('targetAccountId', val)}
                                options={accounts}
                                selectedComponent={(val) => {
                                    return (<>
                                        <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.iconColor} />
                                        <Text>{`${val.name} ( ${formatCurrency(val.balance)})`}</Text>
                                    </>)
                                }}
                            />

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Biaya Transfer (Rp)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    value={formatCurrency(formData.fee)}
                                    onChangeText={(text) => handleChange('fee', unformatCurrency(text))}
                                />
                            </View>
                        </>
                    )}

                    {/* Description Input */}
                    <Text style={{ ...styles.label, padding: 10 }}>Deskripsi</Text>
                    <TextInput
                        style={[styles.input, { height: 80, width: "100%" }]}
                        placeholder="Tambahkan deskripsi (opsional)"
                        multiline
                        value={formData.description}
                        onChangeText={(text) => handleChange('description', text)}
                    />

                    {/* Actions Button */}
                    <View style={{ flexDirection: 'row', marginTop: 16 }}>
                        <ActionButton title="Hapus" backgroundColor="#F44336" onPress={handleDelete} />
                        <ActionButton title="Salin" backgroundColor="#2196F3" onPress={handleCopy} />
                        <ActionButton title="Edit" backgroundColor="#4CAF50" onPress={handleEdit} disabled={!isFormEditable} />
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
        backgroundColor: '#fff',
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
        borderColor: '#ccc',
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        width: 250,
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
        // padding: 15
    },
});

export default TransactionForm;