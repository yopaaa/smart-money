import PeriodNavigator from '@/components/PeriodNavigator';
import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ImageModal from '../(transaction)/ImageModal';
import { FOLDER_PATH } from '../(transaction)/TakePhoto';


export function GalleryScreen() {
    const { viewMode = "month", selectedDate: selectedDates } = useLocalSearchParams();
    const { filterTransactions } = useTransactions();
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updateTriggers, setUpdateTriggers] = useState();
    const [groupedImages, setGroupedImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setSelectedDate(moment(selectedDates))
            setUpdateTriggers(Date.now());
        }, [])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };



    const filteredTransactions = useMemo(() => {
        const start = moment(selectedDate);
        let end = moment(selectedDate);
        console.log("Galery screen..");

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

        return filterTransactions({
            startDate: start.valueOf(),
            endDate: end.valueOf(),
            hasImage: true,
        });
    }, [selectedDate, viewMode, isRefreshing, updateTriggers]);

    const groupedTransactions = useMemo(() => {
        const groups = {};

        filteredTransactions.forEach((item) => {
            const mDate = moment(Number(item.createdAt)).startOf('day');
            const now = moment().startOf('day');
            const diff = now.diff(mDate, 'days');

            let dateKey = diff === 0
                ? 'Today'
                : diff === 1
                    ? 'Yesterday'
                    : mDate.format('DD MMM YYYY');

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    data: [],
                    timestamp: mDate.valueOf(),
                    total: 0,
                };
            }

            groups[dateKey].data.push(item);

            const value =
                item.type === 'income'
                    ? item.amount
                    : item.type === 'expense'
                        ? -item.amount
                        : 0;

            groups[dateKey].total += value;
        });

        return Object.entries(groups)
            .map(([date, group]) => ({
                date,
                timestamp: group.timestamp,
                total: group.total,
                data: group.data,
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [filteredTransactions]);

    const loadImages = useCallback(async () => {
        try {
            const dirInfo = await FileSystem.getInfoAsync(FOLDER_PATH);
            if (!dirInfo.exists) {
                setGroupedImages([]);
                return;
            }

            const processedImages = [];

            for (const dateGroup of groupedTransactions) {
                const imagesForDate = [];

                for (const transaction of dateGroup.data) {
                    if (transaction.img) {
                        const filePath = `${FOLDER_PATH}/${transaction.img}`;
                        const fileInfo = await FileSystem.getInfoAsync(filePath);
                        if (fileInfo.exists) {
                            imagesForDate.push({
                                id: transaction.id,
                                name: transaction.img,
                                uri: filePath,
                                size: fileInfo.size,
                                modificationTime: parseInt(transaction.createdAt),
                                transactionTitle: transaction.title,
                                transactionAmount: transaction.amount,
                                transactionType: transaction.type,
                            });
                        }
                    }
                }

                if (imagesForDate.length > 0) {
                    imagesForDate.sort((a, b) => b.modificationTime - a.modificationTime);
                    processedImages.push({
                        date: dateGroup.date,
                        timestamp: dateGroup.timestamp,
                        images: imagesForDate,
                        count: imagesForDate.length
                    });
                }
            }

            setGroupedImages(processedImages);
        } catch (error) {
            console.error('Error loading images:', error);
            Alert.alert('Error', 'Failed to load images');
        }
    }, [groupedTransactions]);

    // Gunakan useEffect untuk trigger loadImages saat groupedTransactions berubah
    useEffect(() => {
        loadImages();
    }, [loadImages]);

    const openImageModal = (imageItem) => {
        setSelectedImage(imageItem);
        setModalVisible(true);
    };

    const renderDateHeader = ({ item }) => (
        <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>{item.date}</Text>
            <Text style={styles.dateHeaderCount}>{item.count} photos</Text>
        </View>
    );

    const renderImageItem = ({ item }) => (
        <View style={styles.imageContainer}>
            <TouchableOpacity
                style={styles.imageWrapper}
                onPress={() => openImageModal(item)}
            >
                <Image source={{ uri: item.uri }} style={styles.image} />

                {/* Transaction info overlay */}
                <View style={styles.imageOverlay}>
                    <Text style={styles.transactionTitle} numberOfLines={1}>
                        {item.transactionTitle}
                    </Text>
                    <Text style={styles.transactionAmount}>
                        {item.transactionType === 'expense' ? '-' : '+'}
                        Rp {item.transactionAmount.toLocaleString('id-ID')}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderDateSection = ({ item }) => (
        <View style={styles.dateSection}>
            {renderDateHeader({ item })}
            <FlatList
                data={item.images}
                renderItem={renderImageItem}
                keyExtractor={(imageItem) => imageItem.id}
                numColumns={3}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

    if (groupedImages.length === 0) {
        return (
            <>
                <PeriodNavigator
                    selectedDate={selectedDate}
                    viewMode={viewMode}
                    onDateChange={setSelectedDate}
                />
                    {/* <Text style={styles.emptyText}>No images found</Text> */}

                <View style={[styles.centerContainer,]}>
                    <Ionicons name="images-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No images found</Text>
                    <Text style={styles.emptySubText}>
                        No transaction images found for the selected period
                    </Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={loadImages}>
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    }

    return (
        <>
            <PeriodNavigator
                selectedDate={selectedDate}
                viewMode={viewMode}
                onDateChange={setSelectedDate}
            />

            <FlatList
                data={groupedImages}
                renderItem={renderDateSection}
                keyExtractor={(item, index) => `${item.date}-${index}`}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
            />

            <ImageModal
                enableDelete={false}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                imageItem={selectedImage}
            />
        </>
    );
}

export default function Example() {
    return (
        <View style={styles.container}>
            <SimpleHeader title="Gallery History" />
            <GalleryScreen />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight || 0,
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    flatListContent: {
        height: "100%",
        flex: 1,
        paddingBottom: 20,
    },
    dateSection: {
        marginBottom: 20,
    },
    dateHeader: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    dateHeaderCount: {
        fontSize: 14,
        color: '#666',
    },
    imageContainer: {
        width: '33.33%',
        aspectRatio: 1,
        padding: 1,
    },
    imageWrapper: {
        position: 'relative',
        flex: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 4,
    },
    transactionTitle: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '500',
    },
    transactionAmount: {
        color: '#fff',
        fontSize: 9,
        marginTop: 1,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
        marginTop: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    refreshButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

