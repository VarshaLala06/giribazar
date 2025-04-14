import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const SellHistory = () => {
  const { t } = useTranslation(); // Use translation hook
  const [sellHistory, setSellHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('sellHistory');
        console.log('Loaded Sell History:', storedHistory); // ✅ Debugging Log
        if (storedHistory) {
          setSellHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error fetching sell history:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <LinearGradient colors={['#A9D6E5', '#AED9E0', '#2A6F97']} style={styles.container}>
      <Text style={styles.title}>{t('sellHistoryTitle')}</Text>
      <FlatList
        data={sellHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          if (!item || !item.name) {
            return null; // Skip rendering if item is null or invalid
          }
          return (
            <View style={styles.card}>
              <Text>{t('productLabel')}: {item.name}</Text>
              <Text>{t('categoryLabel')}: {item.category}</Text>
              <Text>{t('quantitySoldLabel')}: {item.quantity}</Text>
              <Text>{t('priceLabel')}: {item.price}</Text>
            </View>
          );
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: { backgroundColor: '#AED9E0', padding: 15, borderRadius: 15, marginBottom: 10 },
});

export default SellHistory;