import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
// import { PieChart } from 'react-native-svg-charts';

const data = [
  { label: 'Lost', value: 200000, percent: 36, color: '#F87171', icon: 'close-circle-outline' },
  { label: 'Food', value: 154000, percent: 28, color: '#FBBF24', icon: 'food' },
  { label: 'Handy', value: 100000, percent: 18, color: '#FACC15', icon: 'cellphone' },
  { label: 'bensin', value: 33000, percent: 6, color: '#FDE047', icon: 'gas-station' },
  { label: 'Beauty', value: 25000, percent: 5, color: '#86EFAC', icon: 'lipstick' },
  { label: 'Getränk', value: 18000, percent: 3, color: '#5EEAD4', icon: 'cup' },
  { label: 'Social Life', value: 10000, percent: 2, color: '#A78BFA', icon: 'account-group' },
  { label: 'Other', value: 7000, percent: 1, color: '#7DD3FC', icon: 'dots-horizontal' },
  { label: 'Gift', value: 5500, percent: 1, color: '#D8B4FE', icon: 'gift' },
];

const StatsScreen = () => {
  const pieData = data.map((item, index) => ({
    key: `${item.label}-${index}`,
    value: item.value,
    svg: { fill: item.color },
    arc: { outerRadius: '100%', padAngle: 0 },
  }));

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
        data={data}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.percentBox, { backgroundColor: item.color }]}>
                <Text style={styles.percentText}>{item.percent}%</Text>
              </View>
              <MaterialCommunityIcons name={item.icon} size={20} color="" />
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <Text style={styles.amount}>Rp {item.value.toLocaleString()}</Text>
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
