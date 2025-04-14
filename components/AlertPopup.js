import React from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons'; // Importing Material Icons

const alerts = [
  { product: 'Milk Products', quantity: 10 },
  { product: 'Onions', quantity: 6, message: 'Onions are too low' },
  { product: 'Tomatoes', quantity: 5, message: 'Tomatoes are too low' },
  { product: 'Potatoes', quantity: 8, message: 'Potatoes are too low' },
  { product: 'Cabbage', quantity: 4, message: 'Cabbage stock is low' },
  { product: 'Carrots', quantity: 7, message: 'Carrots are running out' },
  { product: 'Peppers', quantity: 3, message: 'Peppers need restocking' },
];

const AlertPopup = () => {
  const { t } = useTranslation(); // Use translation hook

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t('lowStockAlertsTitle')}</Text>

        {alerts.length > 0 ? (
          <FlatList
            data={alerts}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={styles.alertCard}>
                <View style={styles.alertRow}>
                  <MaterialIcons name="warning" size={24} color="white" />
                  <Text style={styles.alertText}>
                    {item.message || `${t('defaultLowStockMessage', { product: item.product })}`}
                  </Text>
                </View>
                <Text style={styles.alertText}>{t('availableQuantityLabel')}: {item.quantity}kg</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noAlerts}>{t('noAlertsMessage')}</Text>
        )}

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{t('viewAllAlertsButton')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1, 
    resizeMode: "cover", // Ensure the image covers the whole screen
    justifyContent: "center", 
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20, // Prevents content from being cut off
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#001258',
  },
  alertCard: {
    backgroundColor: '#9E2A2B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  noAlerts: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#001258',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AlertPopup;