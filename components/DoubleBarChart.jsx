import moment from 'moment';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { formatNumberShort, generateYAxisLabels, getMaxAmountWithPadding } from './BarChart';

const groupIncomeExpenseBars = (transactions) => {
    const map = new Map();

    transactions.forEach((tx) => {
        const date = moment(Number(tx.createdAt)).format('YYYY-MM-DD');
        const item = map.get(date) || { income: 0, expense: 0 };

        if (tx.type === 'income') {
            item.income += tx.amount;
        } else if (tx.type === 'expense') {
            item.expense += tx.amount;
        }

        map.set(date, item);
    });

    const sortedDates = Array.from(map.entries()).sort(
        ([a], [b]) => new Date(a) - new Date(b)
    );

    const barData = [];

    sortedDates.forEach(([date, { income, expense }], index) => {
        const label = moment(date).format('DD');
        if (income > 0) {
            barData.push({
                value: income,
                frontColor: 'green',
                label,           // Hanya income yang pakai label
                spacing: 1,
                topLabelComponent: () => (
                    <Text style={{ color: '#333', fontSize: 6, marginBottom: 4, fontWeight: 800 }}>
                        {formatNumberShort(income)}
                    </Text>
                ),
            });
        } else {
            // Tetap tambahkan bar kosong agar pasangan tetap rapi
            barData.push({
                value: 5000, frontColor: 'green', label, spacing: 1,
            });
        }

        if (expense > 0) {
            barData.push({
                value: expense,
                frontColor: 'red',
                topLabelComponent: () => (
                    <Text style={{ color: '#333', fontSize: 6, marginBottom: 4, fontWeight: 800 }}>
                        {formatNumberShort(expense)}
                    </Text>
                ),
            });
        } else {
            barData.push({ value: 5000, frontColor: 'red' });
        }
    });

    return barData;
};

function CustomBarChart({ data = [], title }) {

    const barData = useMemo(() => {
        return groupIncomeExpenseBars(data);
    }, [data]);

    const maxValue = useMemo(() => {
        return getMaxAmountWithPadding(barData);

    }, [barData]);

    if (!barData || barData.length === 0) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Memuat grafik...</Text>
        </View>
    );
}


    return (
        <ScrollView contentContainerStyle={{ paddingTop: 10, padding: 10, paddingBottom: 0, flex: 1, gap: 30, flexDirection: "row" }}>
            <View>
                {title && <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>{title}</Text>}

                <BarChart

                    scrollToEnd
                    width={320}
                    height={200}
                    data={barData}
                    barWidth={20}
                    spacing={13}
                    initialSpacing={20}
                    endSpacing={10}
                    frontColor="lightgray"
                    yAxisLabel="Rp "
                    yAxisLabelWidth={30}
                    yAxisTextStyle={{ color: '#333', width: 40 }}
                    xAxisLabelTextStyle={{ color: '#333', fontSize: 10, fontWeight: 800 }}
                    noOfSections={6}
                    maxValue={maxValue}
                    barBorderRadius={4}
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisLabelTexts={generateYAxisLabels(maxValue)}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
});


export default CustomBarChart;
