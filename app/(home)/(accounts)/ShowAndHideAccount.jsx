import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import CustomList from './CustomList';

const ShowAndHideAccount = () => {
  const router = useRouter();
  const { editAccount, accountsGrouped, refetchData, saveSetting } = useTransactions();
  const [data, setData] = useState(accountsGrouped);

  useEffect(() => {
    setData(accountsGrouped);
  }, [accountsGrouped]);

  const handleHide = async (accountId, groupTitle, isHidden) => {
    try {
      const updatedGroups = data.map(group => {
        if (group.title === groupTitle) {
          return {
            ...group,
            data: group.data.map(acc =>
              acc.id === accountId ? { ...acc, hidden: isHidden == 0 ? true : false } : acc
            ),
          };
        }
        return group;
      });

      setData(updatedGroups);
      await editAccount(accountId, { hidden: isHidden == 0 ? true : false });
      await saveSetting("@modified_account_order", updatedGroups);
      refetchData();

      console.log(`Account ${accountId} marked as hidden.`);
    } catch (e) {
      console.error("Failed to hide account:", e);
      Alert.alert("Error", "Failed to hide the account.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}>
      <SimpleHeader title="Show And Hide Settings" style={{ paddingHorizontal: 15 }} />

      <CustomList
        data={data}
        groupTools={(data) => {
          return (
            <Text
              style={[
                styles.accountBalance,
                data.balance < 0 ? styles.liabilityBalance : styles.assetBalance,
              ]}
            >
              {formatCurrency(data.balance) || 0}
            </Text>
          );
        }}
        itemsTools={(data, groupTitle) => (
          <>
            <TouchableOpacity
              onPress={() => handleHide(data.id, groupTitle, data.hidden)}
              style={{ paddingHorizontal: 15 }}
            >
              <MaterialCommunityIcons
                name={data.hidden ? "eye-off" : "eye"}
                size={22}
                color={data.hidden ? "brown" : "green"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '(home)/(accounts)/EditAccount',
                  params: { id: data.id },
                });
              }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
          </>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  assetBalance: {
    color: '#007AFF',
  },
  liabilityBalance: {
    color: '#FF3B30',
  },
});

export default ShowAndHideAccount;
