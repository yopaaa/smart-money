import CustomPicker from '@/components/CustomPicker';
import PeriodNavigator from '@/components/PeriodNavigator';
import PieChart from '@/components/PieChart';
import SlideSelect from '@/components/SlideSelect';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../hooks/ThemeContext';
import { useTransactions } from '../TransactionContext';
import timePeriods from '../json/timePeriods.json';

export default function HomeScreen() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const { filterTransactions, getCategoryById } = useTransactions();
    const [viewMode, setViewMode] = useState('month'); // 'week' | 'month' | 'quarter' | 'year'
    const [selectedDate, setSelectedDate] = useState(moment()); // bisa hari berapa pun
    const [isRefreshing, setisRefreshing] = useState(false)

    const [expenseCategoriesGroub, setExpenseCategoriesGroub] = useState([])
    const [incomeCategoriesGroub, setIncomeCategoriesGroub] = useState([])
    const [type, setType] = useState('expense');

    // Auto refresh when focus
    const [updateTrigers, setupdateTrigers] = useState()
    useEffect(() => {
        setSelectedDate(moment())
    }, [])

    useFocusEffect(
        useCallback(() => {
            setupdateTrigers(Date.now());

            try {
                const expenseData = convertTransactionsByType(filteredTransactions, 'expense');
                const incomeData = convertTransactionsByType(filteredTransactions, 'income');

                setExpenseCategoriesGroub(expenseData || []);
                setIncomeCategoriesGroub(incomeData || []);
            } catch (error) {
                console.error('Error converting transactions:', error);
                setExpenseCategoriesGroub([]);
                setIncomeCategoriesGroub([]);
            }
        }, [type, selectedDate, viewMode])
    );

    function convertTransactionsByType(transactions, type = 'expense') {
        const filtered = transactions.filter(t => t.type === type);

        const total = filtered.reduce((sum, t) => sum + t.amount, 0);

        const grouped = {};
        filtered.forEach(t => {
            const key = t.category || 'Other';
            if (!grouped[key]) {
                grouped[key] = 0;
            }
            grouped[key] += t.amount;
        });

        const result = Object.entries(grouped).map(([category, amount]) => {
            const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
            const icon = getCategoryById(category) || {
                "id": "29680517",
                "name": "Lainnya",
                "icon": "dots-horizontal",
                "color": "#b0bec5",
                "type": "expense"
            }
            return { category, amount, percent, icon };
        });

        // Urutkan berdasarkan amount terbesar
        return result.sort((a, b) => b.amount - a.amount);
    }

    const filteredTransactions = useMemo(() => {
        const start = moment(selectedDate);
        let end = moment(selectedDate);

        if (viewMode === 'week') {
            start.startOf('week');
            end.endOf('week');
        } else if (viewMode === 'month') {
            start.startOf('month');
            end.endOf('month');
        } else if (viewMode === 'quarter') {
            start.startOf('quarter');
            end.endOf('quarter');
        } else if (viewMode === 'year') {
            start.startOf('year');
            end.endOf('year');
        }

        // Gunakan filterTransactions dari context
        return filterTransactions({
            startDate: start.valueOf(),
            endDate: end.valueOf()
        });
    }, [selectedDate, viewMode, updateTrigers]);


    const handleRefresh = () => {
        setisRefreshing(true)
        setupdateTrigers(Date.now())
        setTimeout(() => {
            setisRefreshing(false)
        }, 1000);
    }

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>

            {/* Header */}
            <View style={styles.headercontainer}>
                <SlideSelect
                    initial={type}
                    onChange={(val) => setType(val)}
                    options={[
                        { key: 'income', label: 'Income', icon: 'arrow-down-circle' },
                        { key: 'expense', label: 'Expense', icon: 'arrow-up-circle' },
                    ]}
                />
                <ThemedText style={styles.headerTitle}>Statistics</ThemedText>
                <View style={styles.headerIcons}>
                    <CustomPicker
                        inputContainerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                        pickerStyle={styles.picker}
                        TouchableComponent={<MaterialCommunityIcons name="calendar-month" size={25} color={theme.colors.text}/>}
                        onSelect={(val) => { setViewMode(String(val.name).toLocaleLowerCase()) }}
                        options={timePeriods}
                        selectedComponent={(val) => {
                            return (<>
                                <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.color} />
                                <Text>{val.name}</Text>
                            </>)
                        }}
                    />
                </View>
            </View>

            <PeriodNavigator
                selectedDate={selectedDate}
                viewMode={viewMode}
                onDateChange={setSelectedDate}
                theme={theme}
            />

            {type == "income" && <PieChart
                data={incomeCategoriesGroub}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                legendOnPress={(data) => {
                    router.push({
                        pathname: 'transaction/PerCategoriesTransactions',
                        params: {
                            category: data.category,
                            title: data.icon.name,
                            type: type,
                            viewMode, selectedDate
                        }
                    });
                }}
            />}

            {type == "expense" && <PieChart
                data={expenseCategoriesGroub}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                legendOnPress={(data) => {
                    router.push({
                        pathname: 'transaction/PerCategoriesTransactions',
                        params: {
                            category: data.category,
                            title: data.icon.name,
                            type: type,
                            viewMode, selectedDate
                        }
                    });
                }}

            />}


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        flexDirection: "column",
        // paddingBottom: 100
    },
    item: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        color: '#666',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    income: {
        color: '#2e7d32',
    },
    expense: {
        color: '#c62828',
    },
    transfer: {
        color: '#7b7b7b',
    },
    headercontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSpacing: {
        marginHorizontal: 10,
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
    },
    overviewBox: {
        paddingTop: 16,
    },
    overviewHeader: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10
    },
    overviewTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    label: {
        color: '#555',
    },
    transactionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        padding: 10
    },
    dateHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 16,
    },
    day: {
        fontSize: 16,
        fontWeight: '500',
    },
    dateSmall: {
        color: '#666',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomColor: '#1F2937',
        borderBottomWidth: 1,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    percentBox: {
        width: 40,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    percentText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    }
});