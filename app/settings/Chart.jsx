import { Dimensions, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

// Fungsi bantu: kelompokkan dan jumlahkan berdasarkan tanggal
const groupDataByDate = (data) => {
  const grouped = {};

  data.forEach(item => {
    const dateStr = new Date(item.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }

    grouped[dateStr].push(item.val);
  });

  return Object.keys(grouped).map((date, index) => {
    const total = grouped[date].reduce((a, b) => a + b, 0);
    return { date, total, index: index + 1 };
  });
};

const DataChart = () => {
  const rawData = [
    { val: 104000, date: new Date('2025-05-01T10:00:00').getTime() },
    { val: 124000, date: new Date('2025-05-02T11:00:00').getTime() },
    { val: 109000, date: new Date('2025-05-03T09:30:00').getTime() },
    { val: 159000, date: new Date('2025-05-04T14:00:00').getTime() },
    { val: 179000, date: new Date('2025-05-05T13:45:00').getTime() },
    { val: 159000, date: new Date('2025-05-06T15:15:00').getTime() },
    { val: 147000, date: new Date('2025-05-07T08:20:00').getTime() },
    { val: 89000, date: new Date('2025-05-08T12:00:00').getTime() },
    { val: 79000, date: new Date('2025-05-09T17:00:00').getTime() },
    { val: 229000, date: new Date('2025-05-10T10:30:00').getTime() },
    { val: 29000, date: new Date('2025-05-11T09:15:00').getTime() },
  ];


  const groupedData = groupDataByDate(rawData);

  // Format data untuk react-native-gifted-charts
  const chartData = groupedData.map((item, index) => ({
    value: item.total,
    label: item.date,
    labelTextStyle: { fontSize: 10 },
    frontColor: '#2563eb',
    spacing: 30,
  }));

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10
      }}>
        Grafik Total Nilai per Hari
      </Text>

      <LineChart
        data={chartData}
        height={300}
        width={screenWidth - 32}
        spacing={30}
        // endSpacing={0}
        initialSpacing={0}
        thickness={3}
        color="#2563eb"
        maxValue={Math.max(...groupedData.map(d => d.total)) * 1.1}
        yAxisTextStyle={{ fontSize: 10 }}
        xAxisLabelTextStyle={{ fontSize: 10, rotation: 45, marginTop: 4 }}
        hideDataPoints={false}
        showValuesOnTopOfDataPoints
        showXAxisIndices
        xAxisColor="#e5e7eb"
        yAxisColor="#e5e7eb"
        noOfSections={5}
        areaChart
        startFillColor="rgba(37, 99, 235, 0.3)"
        endFillColor="rgba(37, 99, 235, 0.1)"
        startOpacity={0.5}
        endOpacity={0.1}
        isAnimated
        rotateLabel
        curved
        focusEnabled
        showStripOnFocus
        showTextOnFocus
        animateOnDataChange
        // curveType="bezier"
        // curveType={CurveType.QUADRATIC}
      />

      {/* Tabel ringkasan */}
      <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 24 }}>Data per Tanggal</Text>
      {groupedData.map((item, index) => (
        <View key={index} style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: index % 2 === 0 ? '#f9fafb' : '#fff',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderBottomWidth: 1,
          borderColor: '#e5e7eb'
        }}>
          <Text>{index + 1}</Text>
          <Text>{item.date}</Text>
          <Text>{item.total.toLocaleString('id-ID')}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default DataChart;
