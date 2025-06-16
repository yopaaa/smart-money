import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PeriodNavigator({ selectedDate, viewMode, onDateChange, theme }) {
  const getPeriodLabel = () => {
    if (viewMode === 'week') {
      const start = selectedDate.clone().startOf('week');
      const end = selectedDate.clone().endOf('week');
      return `${start.format('D')}-${end.format('D MMM YYYY')}`;
    }
    if (viewMode === 'month') return selectedDate.format('MMMM YYYY');
    if (viewMode === 'quarter') return `Q${selectedDate.quarter()} ${selectedDate.year()}`;
    if (viewMode === 'year') return selectedDate.format('YYYY');
  };

  const goToPrev = () => {
    const newDate = selectedDate.clone();
    if (viewMode === 'week') onDateChange(newDate.subtract(1, 'week'));
    if (viewMode === 'month') onDateChange(newDate.subtract(1, 'month'));
    if (viewMode === 'quarter') onDateChange(newDate.subtract(1, 'quarter'));
    if (viewMode === 'year') onDateChange(newDate.subtract(1, 'year'));
  };

  const goToNext = () => {
    const newDate = selectedDate.clone();
    if (viewMode === 'week') onDateChange(newDate.add(1, 'week'));
    if (viewMode === 'month') onDateChange(newDate.add(1, 'month'));
    if (viewMode === 'quarter') onDateChange(newDate.add(1, 'quarter'));
    if (viewMode === 'year') onDateChange(newDate.add(1, 'year'));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={goToPrev}>
        <MaterialCommunityIcons name="chevron-left" size={30} color={theme ? theme.colors.text : null} />
      </TouchableOpacity>

      <Text style={[styles.label, { color: theme ? theme.colors.text : null }]}>{getPeriodLabel()}</Text>

      <TouchableOpacity onPress={goToNext}>
        <MaterialCommunityIcons name="chevron-right" size={30} color={theme ? theme.colors.text : null} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
