import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Alert,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import CustomList from '../../(accounts)/CustomList';

function groupCategoriesByType(categories) {
    const typeMap = {
        expense: {
            title: "Expense Categories",
            icon: "wallet-outline",
            color: "#f44336",
        },
        income: {
            title: "Income Categories",
            icon: "cash-plus",
            color: "#4caf50",
        },
        transfer: {
            title: "Transfer Categories",
            icon: "bank-transfer",
            color: "#2196f3",
        },
        none: {
            title: "System Categories",
            icon: "cog-outline",
            color: "#9e9e9e",
        }
    };

    const grouped = {};

    for (const cat of categories) {
        if (!grouped[cat.type]) {
            grouped[cat.type] = {
                title: typeMap[cat.type]?.title ?? "Unknown",
                icon: typeMap[cat.type]?.icon ?? "help",
                color: typeMap[cat.type]?.color ?? "#ccc",
                type: cat.type,
                data: []
            };
        }

        grouped[cat.type].data.push({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            iconColor: cat.color
        });
    }

    return Object.values(grouped);
}
const CategoryPage = () => {
      const { title } = useLocalSearchParams();
    
    const router = useRouter();
    const {
        deleteCategory,
        categories,
        refetchData
    } = useTransactions();

    const handleDelete = (id) => {
        Alert.alert('Hapus Kategori', 'Yakin ingin menghapus kategori ini?', [
            { text: 'Batal' },
            {
                text: 'Hapus',
                style: 'destructive',
                onPress: () => {
                    deleteCategory(id);
                    refetchData()
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <SimpleHeader
                title={title}
                rightComponent={null}
            />

            <CustomList
                data={groupCategoriesByType(categories)}
                groupTools={(item) => {
                    return <TouchableOpacity
                        onPress={() => {
                            router.push({
                                pathname: '(home)/(settings)/Category/CreateCategory',
                                params: {
                                    title: item.title,
                                    type: item.type
                                }
                            });
                        }}>
                        <MaterialCommunityIcons name="plus" size={22} color="#000" />
                    </TouchableOpacity>
                }}
                itemsTools={(data) => {
                    return (<>
                        <TouchableOpacity onPress={() => handleDelete(data.id)}>
                            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF3B30" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            router.push({
                                pathname: '(home)/(accounts)/EditAccount',
                                params: {
                                    id: data.id
                                }
                            });
                        }}>
                            <MaterialCommunityIcons name="pencil-outline" size={22} color="#007AFF" />
                        </TouchableOpacity></>)
                }}
            />
        </View>
    );
};

export default CategoryPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight || 0,
    }
});