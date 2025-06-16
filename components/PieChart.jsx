import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { formatCurrency } from '../utils/number';

const { width: screenWidth } = Dimensions.get('window');

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

const createArcPath = (centerX, centerY, radius, startAngle, endAngle, isExpanded = false) => {
    const expandOffset = isExpanded ? 20 : 0;
    const actualRadius = radius + expandOffset;
    const midAngle = (startAngle + endAngle) / 2;
    const offsetX = isExpanded ? Math.cos((midAngle - 90) * Math.PI / 180) * 12 : 0;
    const offsetY = isExpanded ? Math.sin((midAngle - 90) * Math.PI / 180) * 12 : 0;
    const adjustedCenterX = centerX + offsetX;
    const adjustedCenterY = centerY + offsetY;

    if (endAngle - startAngle >= 360) {
        const midAngle = startAngle + 180;
        const start1 = polarToCartesian(adjustedCenterX, adjustedCenterY, actualRadius, startAngle);
        const mid = polarToCartesian(adjustedCenterX, adjustedCenterY, actualRadius, midAngle);
        const end1 = polarToCartesian(adjustedCenterX, adjustedCenterY, actualRadius, startAngle + 359.9);

        return [
            'M', adjustedCenterX, adjustedCenterY,
            'L', start1.x, start1.y,
            'A', actualRadius, actualRadius, 0, '0', 1, mid.x, mid.y,
            'A', actualRadius, actualRadius, 0, '0', 1, end1.x, end1.y,
            'Z',
        ].join(' ');
    }

    const start = polarToCartesian(adjustedCenterX, adjustedCenterY, actualRadius, endAngle);
    const end = polarToCartesian(adjustedCenterX, adjustedCenterY, actualRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
        'M', adjustedCenterX, adjustedCenterY,
        'L', start.x, start.y,
        'A', actualRadius, actualRadius, 0, largeArcFlag, 0, end.x, end.y,
        'Z',
    ].join(' ');
};

const AnimatedPieChart = ({ data, refreshControl, legendOnPress = () => { } }) => {
    const [animatedValues, setAnimatedValues] = useState();
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const size = Math.min(screenWidth * 0.8, 320);
    const radius = size / 2 - 60;
    const centerX = size / 2;
    const centerY = size / 2;
    const total = data.reduce((sum, item) => sum + item.amount, 0);

    const [chartData, setchartData] = useState([])

    useEffect(() => {
        if (data.length === 1) {
            const singleDataFormatted = [{
                label: data[0].icon.name,
                value: 100,
                amount: data[0].amount,
                color: data[0].icon.color,
                icon: data[0].icon.icon
            }];
            setchartData(singleDataFormatted);
            setAnimatedValues([360]);
            setIsLoaded(true);
            setSelectedIndex(null);
            return;
        }

        setAnimatedValues(data.map(() => 0));
        setSelectedIndex(null);
        setIsLoaded(false);

        const formattedData = data.map(item => ({
            label: item.icon.name,
            value: item.percent,
            amount: item.amount,
            color: item.icon.color,
            icon: item.icon.icon
        }));

        setchartData(formattedData);

        formattedData.forEach((_, index) => {
            setTimeout(() => {
                setAnimatedValues(prev => {
                    const newValues = [...prev];
                    newValues[index] = (formattedData[index].value / 100) * 360;
                    return newValues;
                });
            }, index * 150);
        });

        setTimeout(() => {
            setIsLoaded(true);
        }, formattedData.length * 150 + 300);

    }, [data]);

    const renderSlice = (item, index, startAngle, endAngle) => {
        const isSelected = selectedIndex === index;
        const animatedAngle = animatedValues[index];
        const currentEndAngle = startAngle + animatedAngle;

        if (animatedAngle === 0) return null;

        const path = createArcPath(centerX, centerY, radius, startAngle, currentEndAngle, isSelected);

        const midAngle = (startAngle + currentEndAngle) / 2;
        const labelRadius = radius + (isSelected ? 45 : 35);
        const labelX = centerX + Math.cos((midAngle - 90) * Math.PI / 180) * labelRadius + (isSelected ? Math.cos((midAngle - 90) * Math.PI / 180) * 12 : 0);
        const labelY = centerY + Math.sin((midAngle - 90) * Math.PI / 180) * labelRadius + (isSelected ? Math.sin((midAngle - 90) * Math.PI / 180) * 12 : 0);

        return (
            <G key={index}>
                <Path
                    d={path}
                    fill={item.color}
                    stroke="#2C3E50"
                    strokeWidth={0.5}
                    onPress={() => {
                        setSelectedIndex(selectedIndex === index ? null : index);
                    }}
                />
                {animatedAngle > 15 && (
                    <G>
                        <SvgText x={labelX} y={labelY - 5} textAnchor="middle" fill="black" fontSize={isSelected ? "13" : "12"} fontWeight="bold">{item.label}</SvgText>
                        <SvgText x={labelX} y={labelY + 12} textAnchor="middle" fill="black" fontSize={isSelected ? "11" : "10"}>{item.value}%</SvgText>
                    </G>
                )}
            </G>
        );
    };

    const renderPieChart = () => {
        let cumulativeAngle = 0;
        return (
            <View style={styles.chartContainer}>
                
                    <Svg width={size} height={size} style={styles.svg}>
                        <Defs>
                            <RadialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                                <Stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                                <Stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx={centerX} cy={centerY} r={radius - 20} fill="url(#centerGradient)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        {chartData.map((item, index) => {
                            const startAngle = cumulativeAngle;
                            const sliceAngle = chartData.length === 1 ? 360 : (item.value / 100) * 360;
                            const slice = renderSlice(item, index, startAngle, startAngle + sliceAngle);
                            cumulativeAngle += sliceAngle;
                            return slice;
                        })}
                    </Svg>

                <View style={styles.centerContent}>
                    <Text style={styles.centerTitle}>Total</Text>
                    <Text style={styles.centerValue}>{formatCurrency(total)}</Text>
                    <Text style={styles.centerSubtitle}>Pengeluaran</Text>
                </View>
            </View>
        );
    };

    if (!data || data.length === 0) {
        return (
            <FlashList
                refreshControl={refreshControl}
                estimatedItemSize={100}
                data={[0, 1, 2, 3]}
                ListHeaderComponent={() => (
                    <View style={[styles.headerStyle]}>
                        <View style={[styles.headerStyle, { backgroundColor: '#ccc', height: "90%", width: "90%", borderBottomWidth: 0, borderRadius: 10 }]}>
                            <Text>Belum atau tidak ada data</Text>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View key={item} style={[styles.legendItem, { backgroundColor: '#ccc' }]} />
                )}
                ListFooterComponent={<View style={{ margin: 200 }} />}
            />
        );
    }

    return (
        <FlashList
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
            estimatedItemSize={100}
            data={data}
            ListHeaderComponent={() => <View style={styles.headerStyle}>{renderPieChart()}</View>}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    style={[styles.legendItem, selectedIndex === index && styles.selectedLegendItem]}
                    onPress={() => {
                        setSelectedIndex(index);
                        legendOnPress(item);
                    }}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name={item.icon.icon} size={30} color={item.icon.color} style={{ paddingHorizontal: 10 }} />
                    <View style={styles.legendContent}>
                        <Text style={styles.legendLabel}>{item.icon.name}</Text>
                        <Text style={styles.legendAmount}>{formatCurrency(item.amount)}</Text>
                    </View>
                    <Text style={styles.legendValue}>{item.percent}%</Text>
                </TouchableOpacity>
            )}
            ListFooterComponent={<View style={{ margin: 200 }} />}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        width: "100%",
        flexGrow: 1,
    },
    headerStyle: {
        marginBottom: 20,
        height: 400,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "black"
    },
    chartContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 40,
        zIndex: 99
    },
    svg: {
        backgroundColor: 'transparent',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 4,
    },
    centerValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    centerSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 4,
        marginVertical: 2,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
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
    selectedLegendItem: {
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
    legendContent: {
        flex: 1,
    },
    legendLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        marginBottom: 2,
    },
    legendAmount: {
        fontSize: 12,
        color: '#666',
        fontWeight: '400',
    },
    legendValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default AnimatedPieChart;
