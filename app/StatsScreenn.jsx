import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
// import { PieChart } from 'react-native-svg-charts';
import { formatNumber } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import expenseCategories from './page/expenseCategories.json';
import incomeCategories from './page/incomeCategories.json';
import transferCategories from './page/transferCategories.json';
import { useTransactions } from './TransactionContext';

function findCategory(categoryName) {
  const categories = [...expenseCategories, ...incomeCategories, ...transferCategories];
  const category = categories.find(c => c.name === categoryName);
  return category || categories[9];
}

function convertTransactionsByType(transactions, type = 'expense') {
  // Filter hanya transaksi dengan tipe sesuai (income atau expense)
  const filtered = transactions.filter(t => t.type === type);

  // Hitung total nominal untuk semua kategori
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  // Kelompokkan berdasarkan kategori
  const grouped = {};
  filtered.forEach(t => {
    const key = t.category || 'Other';
    if (!grouped[key]) {
      grouped[key] = 0;
    }
    grouped[key] += t.amount;
  });

  // Konversi ke array dengan persentase
  const result = Object.entries(grouped).map(([category, amount]) => {
    const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
    return { category, amount, percent };
  });

  // Urutkan berdasarkan amount terbesar
  return result.sort((a, b) => b.amount - a.amount);
}

const HistoryIcon = ({ name }) => {
        const category = findCategory(name);
        return <MaterialCommunityIcons name={category.icon} size={20} color={category.color} />;
    };

const StatsScreen = () => {
  const { transactions, refetchTransactions } = useTransactions();

  

  const [expenseCategoriesGroub, setExpenseCategoriesGroub] = useState([])
  const [incomeCategoriesGroub, setIncomeCategoriesGroub] = useState([])



  useEffect(() => {
    setExpenseCategoriesGroub(convertTransactionsByType(transactions, 'expense'))
    setIncomeCategoriesGroub(convertTransactionsByType(transactions, 'income'))
  }, [])

  return (
    <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
      {/* Header */}
      <View style={styles.headercontainer}>
        <Text style={styles.header}>May 2025</Text>
        <Text style={styles.subheader}>Expenses  Rp 552.500,00</Text>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        {/* <PieChart style={{ height: 200 }} data={pieData} /> */}
        <Text>Test</Text>
      </View>

      {/* List */}
      <FlatList
        data={expenseCategoriesGroub}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.percentBox]}>
                <Text style={styles.percentText}>{item.percent}%</Text>
              </View>
              {/* <MaterialCommunityIcons name={item.icon} size={20} color="" /> */}
                    <HistoryIcon name={item.category} />
              <Text style={styles.label}>{item.category}</Text>
            </View>
            <Text style={styles.amount}>Rp {formatNumber(item.amount) || 0}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    // backgroundColor: '#111827', // dark theme
  },
  headercontainer: {
    height: 60,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    // color: '#fff',
  },
  subheader: {
    color: '#f87171',
    fontSize: 14,
    marginTop: 4,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 20,
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
  },
  label: {
    fontSize: 14,
    // color: '#fff',
    marginLeft: 8,
  },
  amount: {
    // color: '#fff',
    fontWeight: '600',
  },
});
