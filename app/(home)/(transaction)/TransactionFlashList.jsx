import { ThemedText } from '@/components/ThemedText';
import { ThemedTouchableOpacity } from '@/components/ThemedTouchableOpacity';
import { useTransactions } from '@/hooks/TransactionContext';
import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import moment from 'moment';
import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';

export const FindIcon = React.memo(({ id, size = 30, style }) => {
    const { getCategoryById } = useTransactions();
    const category = getCategoryById(id) || {
        "id": "29680517",
        "name": "Lainnya",
        "icon": "dots-horizontal",
        "color": "#b0bec5",
        "type": "expense"
    };

    return <MaterialCommunityIcons name={category.icon} size={size} color={category.color} style={style} />;
});

const TransactionItem = React.memo(({ item, onPress }) => {
    const isExpense = item.type === 'expense';
    const isTransfer = item.type === 'transfer';
    const amountStyle = isExpense ? styles.expense : isTransfer ? styles.transfer : styles.income;

    return (
        <ThemedTouchableOpacity
            onPress={() => onPress(item)}
            style={styles.item}
        >
            <View style={{ paddingHorizontal: 15 }}>
                <FindIcon id={item.category} />
            </View>

            <View style={{ flex: 1 }}>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                <ThemedText style={styles.date} type="description">
                    {moment().diff(moment(Number(item.createdAt)), 'days') > 3
                        ? moment(Number(item.createdAt)).format('HH:mm, DD MMM YYYY')
                        : moment(Number(item.createdAt)).fromNow()}
                </ThemedText>
            </View>
            <ThemedText style={[styles.amount, amountStyle]}>
                {isExpense ? '-' : isTransfer ? "" : '+'}{formatCurrency(item.amount)}
            </ThemedText>
        </ThemedTouchableOpacity>
    );
});

function detectDateFormat(str) {
    if (/^\d{1,2} [A-Za-z]{3} \d{4}$/.test(str)) {
        return "full_date";
    } else if (/^[0-3]?[0-9]$/.test(str)) {
        return "short_date";
    } else {
        return "invalid";
    }
}

const TransactionGroup = React.memo(({ item, onTransactionPress }) => {
    const isNew = item.date !== "Today" && item.date !== "Yesterday";
    const amountStyle = item.total < 0 ? styles.expense : styles.income;
    const isShortDate = detectDateFormat(item.date);

    return (
        <View style={{ marginTop: 20 }}>
            <View style={styles.transactionBox}>
                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    {isShortDate == "short_date" ? <>
                        <ThemedText style={[styles.dateHeader, isNew && { fontSize: 30 }]}>{item.date}</ThemedText>
                        {isNew && (
                            <View style={styles.transactionRight}>
                                <ThemedText style={styles.day}>{moment(item.timestamp).format('dddd')}</ThemedText>
                                <ThemedText style={styles.dateSmall}>{moment(item.timestamp).format("MMM YYYY")}</ThemedText>
                            </View>
                        )}
                    </> :
                        <>
                            <Text style={[styles.dateHeader, {
                                fontSize: 16,
                                fontWeight: 'bold',
                            }]}>{item.date}</Text>
                        </>
                    }
                </View>
                <Text style={[styles.amount, amountStyle]}>
                    {formatCurrency(item.total)}
                </Text>
            </View>

            {item.data.map(tx => (
                <TransactionItem
                    key={tx.id}
                    item={tx}
                    onPress={onTransactionPress}
                />
            ))}
        </View>
    );
});

const TransactionFlashList = React.memo(({
    groupedTransactions,
    onTransactionPress,
    refreshControl,
    ListHeaderComponent,
    ListEmptyComponent,
    contentContainerStyle,
    ...flashListProps
}) => {
    const renderItem = ({ item }) => (
        <TransactionGroup
            item={item}
            onTransactionPress={onTransactionPress}
        />
    );

    const getItemType = (item) => {
        return 'group';
    };

    return (
        <FlashList
            data={groupedTransactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.date}
            getItemType={getItemType}
            estimatedItemSize={120}
            refreshControl={refreshControl}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={<View style={{ margin: 100 }} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={contentContainerStyle}
            {...flashListProps}
        />
    );
});

export default TransactionFlashList;

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 4,
        marginVertical: 2,
        borderRadius: 12,
        // backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        // color: '#666',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: "right",
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
    transactionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
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
});