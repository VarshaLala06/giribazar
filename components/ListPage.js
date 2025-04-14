import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function ListPage() {
  const { t } = useTranslation(); // Use translation hook
  const [submittedList, setSubmittedList] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem('submittedData');
      if (data) {
        const parsed = JSON.parse(data);
        setSubmittedList(parsed);
        const totalAmount = parsed.reduce((sum, item) => sum + parseFloat(item.price), 0);
        setTotal(totalAmount);
      }
    };
    loadData();
  }, []);

  return (
    <LinearGradient colors={['#A9D6E5', '#AED9E0', '#2A6F97']} style={styles.container}>
      <Text style={styles.heading}>{t('finalSubmittedListTitle')}</Text>
      <FlatList
        data={submittedList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{t('productLabel')}: {item.name}</Text>
            <Text>{t('quantityLabel')}: {item.quantity} kg</Text>
            <Text>{t('priceLabel')}: ₹{item.price}</Text>
          </View>
        )}
      />
      <Text style={styles.totalText}>{t('totalAmountLabel')}: ₹{total}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#fff' },
  card: { backgroundColor: '#AED9E0', padding: 15, borderRadius: 15, marginBottom: 10 },
  totalText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});