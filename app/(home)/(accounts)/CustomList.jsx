import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CustomList = ({ data, groupTools, itemsTools }) => {
  const renderAccount = (data, groupTitle) => (
    <View style={styles.accountRow}>
      <View style={styles.accountInfo}>
        <MaterialCommunityIcons name={data.icon || 'wallet'} size={20} color={data.iconColor || '#333'} />
        <Text style={styles.accountText}>{data.name}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 20 }}>
        {itemsTools && itemsTools(data, groupTitle)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => {
          const { title, icon, color } = item;

          return (<View style={styles.groupContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
            >
              <View style={styles.sectionTitleContainer}>
                <TouchableOpacity>
                  <MaterialCommunityIcons name="dots-grid" size={20} color="#90a4ae" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
                <Text style={styles.groupTitle}>{title}</Text>
              </View>
             
              {groupTools && groupTools(item)}
            </TouchableOpacity>

            {item.data.map(acc => (
              <View key={acc.id}>
                {renderAccount(acc, item.title)}
              </View>
            ))}
          </View>)
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 16 }}>No accounts available</Text>
        }
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={
          <View style={{ padding: 150 }}></View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  groupContainer: {
    marginBottom: 24
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  accountText: {
    fontSize: 15,
    color: '#222'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222'
  }
});

export default CustomList;