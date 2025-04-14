import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useTranslation } from 'react-i18next';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfitLossScreen = () => {
  const { t } = useTranslation();
  const [totalSale, setTotalSale] = useState("");
  const [loadedStock, setLoadedStock] = useState("");
  const [totalExpenses, setTotalExpenses] = useState("");
  const [remainingStock, setRemainingStock] = useState("");
  const [calculatedProfitLoss, setCalculatedProfitLoss] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem("profitLossHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  };

  const saveToHistory = async (entry) => {
    const updated = [entry, ...history.slice(0, 4)]; // Limit to 5 entries
    setHistory(updated);
    await AsyncStorage.setItem("profitLossHistory", JSON.stringify(updated));
  };

  const handleCalculate = () => {
    const sale = parseFloat(totalSale) || 0;
    const stock = parseFloat(loadedStock) || 0;
    const expenses = parseFloat(totalExpenses) || 0;
    const remainingStockAmount = parseFloat(remainingStock) || 0;
    const result = sale - (stock + expenses + remainingStockAmount);
    setCalculatedProfitLoss(result);
    saveToHistory({
      date: new Date().toLocaleDateString(),
      amount: result,
    });
  };

  const isProfit = calculatedProfitLoss !== null && calculatedProfitLoss >= 0;

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>
          <Icon name="finance" size={32} color="#0077b6" /> {t('profitLossTitle')}
        </Text>

        {[ // Input Cards
          { label: 'totalSaleLabel', value: totalSale, setValue: setTotalSale, icon: 'cash' },
          { label: 'loadedStockLabel', value: loadedStock, setValue: setLoadedStock, icon: 'truck' },
          { label: 'remainingStockLabel', value: remainingStock, setValue: setRemainingStock, icon: 'warehouse' },
          { label: 'totalExpensesLabel', value: totalExpenses, setValue: setTotalExpenses, icon: 'credit-card' },
        ].map(({ label, value, setValue, icon }) => (
          <View style={styles.card} key={label}>
            <Text style={styles.label}><Icon name={icon} size={18} color="#0077b6" /> {t(label)}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
              placeholder={t(label + 'Placeholder')}
              placeholderTextColor="#ccc"
            />
          </View>
        ))}

        {calculatedProfitLoss !== null && ( // Result
          <View style={styles.resultContainer}>
            <Text style={styles.dateText}><Icon name="calendar" size={18} /> {new Date().toLocaleDateString()}</Text>
            <Text style={styles.profitLossText}>{t('todayProfitLossLabel')}</Text>
            <Text style={[styles.amount, { color: isProfit ? "green" : "red" }]}>
              {t('currencySymbol')} {calculatedProfitLoss.toFixed(2)}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleCalculate}>
          <LinearGradient colors={["#001258", "#61A5C2"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>
              <Icon name="calculator" size={18} color="white" /> {t('calculateProfitLossButton')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {history.length > 0 && ( // History
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}><Icon name="history" size={20} /> {t('previousEntriesLabel')}</Text>
            {history.map((item, index) => (
              <View style={styles.historyItem} key={index}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={[styles.historyAmount, { color: item.amount >= 0 ? "green" : "red" }]}>
                  {t('currencySymbol')} {item.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#0077b6",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0077b6",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#001258",
  },
  resultContainer: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "#A9D6E5",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#001258",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001258",
  },
  profitLossText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "#001258",
  },
  amount: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonGradient: {
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyContainer: {
    marginTop: 30,
    backgroundColor: "#E4F5F9",
    padding: 15,
    borderRadius: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001258",
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: "#001258",
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ProfitLossScreen;
