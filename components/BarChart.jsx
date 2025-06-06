import moment from 'moment';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';


export const formatNumberShort = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
};


const groupExpensesByDate = (rawData) => {
    const map = new Map();

    // 1. Simpan jumlah transaksi ke map
    rawData.forEach((item) => {
        const date = moment(Number(item.createdAt)).format('YYYY-MM-DD');
        const current = map.get(date) || 0;
        map.set(date, current + item.amount);
    });

    // 2. Dapatkan tanggal awal & akhir dari data
    const dates = rawData.map(item => Number(item.createdAt));
    const minDate = moment(Math.min(...dates));
    const maxDate = moment(Math.max(...dates));

    // 3. Buat semua tanggal dalam rentang tersebut
    const allDates = [];
    let currentDate = minDate.clone();
    while (currentDate.isSameOrBefore(maxDate)) {
        allDates.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, 'day');
    }

    // 4. Buat bar chart data dari semua tanggal
    const result = allDates.map((date) => {
        const amount = map.get(date) || 0;
        return {
            value: amount,
            label: moment(date).format('DD'), // Hanya tampilkan tanggal (DD)
            frontColor: '#177AD5',
            topLabelComponent: () => (
                <Text style={{ color: 'blue', fontSize: 8, marginBottom: 6 }}>
                    {formatNumberShort(amount)}
                </Text>
            ),
        };
    });


    return result;
};

const groupExpensesByWeek = (rawData) => {
    const map = new Map();

    // Hitung total per minggu
    rawData.forEach((item) => {
        const mDate = moment(Number(item.createdAt));
        const weekKey = mDate.format('GGGG-[W]WW'); // ISO Week Format
        const current = map.get(weekKey) || 0;
        map.set(weekKey, current + item.amount);
    });

    // Dapatkan rentang minggu dari data
    const timestamps = rawData.map(item => Number(item.createdAt));
    const start = moment(Math.min(...timestamps)).startOf('isoWeek');
    const end = moment(Math.max(...timestamps)).endOf('isoWeek');

    const allWeeks = [];
    let current = start.clone();
    while (current.isSameOrBefore(end)) {
        allWeeks.push(current.format('GGGG-[W]WW'));
        current.add(1, 'week');
    }

    return allWeeks.map((weekKey, index) => {
        const amount = map.get(weekKey) || 0;
        return {
            value: amount,
            label: weekKey.slice(6), // Hanya "Wxx"
            frontColor: '#177AD5',
            topLabelComponent: () => (
                <Text style={{ color: '#333', fontSize: 10, marginBottom: 4 }}>
                    {formatNumberShort(amount)}
                </Text>
            ),
        };
    });
};


export const getMaxAmountWithPadding = (barData) => {
    const max = Math.max(...barData.map((item) => item.value));
    return max + ((max / 100) * 30);
};

export const generateYAxisLabels = (maxValue, sections = 6) => {
    const step = Math.ceil(maxValue / sections / 1000) * 1000; // step dibulatkan ke ribuan
    return Array.from({ length: sections + 1 }, (_, i) =>
        i === 0 ? '0' : formatNumberShort(i * step)
    );
};


function CustomBarChart({ data = [], mode = "day", title }) {

    const barData = useMemo(() => {
        if (mode === "year") {
            return groupExpensesByWeek(data);
        } else {
            return groupExpensesByDate(data);
        }
    }, [data, mode]);

    const maxValue = useMemo(() => {
        // console.log(JSON.stringify(barData, " ", " "));

        return getMaxAmountWithPadding(barData);
    }, [barData]);

    if (!barData || barData.length === 0) {
        return <Text>Memuat grafik...</Text>;
    }

    return (
        <ScrollView contentContainerStyle={{ paddingTop: 10, padding: 10,paddingBottom: 0, flex: 1, gap: 30, flexDirection: "row" }}>
            <View>
                {title && <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>{title}</Text>}

                <BarChart
                    scrollToEnd
                    width={320}
                    height={200}
                    data={barData}
                    barWidth={25}
                    spacing={13}
                    initialSpacing={20}
                    endSpacing={10}
                    frontColor="lightgray"
                    yAxisLabel="Rp "
                    yAxisLabelWidth={30}
                    yAxisTextStyle={{ color: '#333', width: 40 }}
                    xAxisLabelTextStyle={{ color: '#333', fontSize: 10 }}
                    noOfSections={6}
                    maxValue={maxValue}
                    barBorderRadius={4}
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisLabelTexts={generateYAxisLabels(maxValue)}
                    showLine
                    lineConfig={{
                        color: '#EFBF04',
                        thickness: 3,
                        curved: true,
                        hideDataPoints: true,
                        shiftY: 20,
                    }}
                />
            </View>
        </ScrollView>
    );
}

export default CustomBarChart;
