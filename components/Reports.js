import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Platform,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { DataTable } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';

const ReportPage = () => {
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const salesData = [
    { category: "Vegetables", product: "Carrot", quantity: 10, totalPrice: 200 },
    { category: "Millets", product: "Foxtail Millet", quantity: 5, totalPrice: 250 },
    { category: "Honey", product: "Organic Honey", quantity: 8, totalPrice: 400 },
  ];

  const chartData = salesData.map((item, index) => ({
    name: item.product,
    quantity: item.quantity,
    color: ["#FF6B6B", "#FFD93D", "#6BCB77"][index % 3],
    legendFontColor: "#333",
    legendFontSize: 13,
  }));

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.card}>
          <Text style={styles.title}>{t('salesReportTitle')}</Text>

          <View style={styles.dateContainer}>
            <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>{t('fromLabel')} {fromDate.toDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowToPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>{t('toLabel')} {toDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>

          {showFromPicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowFromPicker(false);
                if (date) setFromDate(date);
              }}
            />
          )}

          {showToPicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowToPicker(false);
                if (date) setToDate(date);
              }}
            />
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.duration(700)} style={styles.chartCard}>
          <PieChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: () => "#333",
            }}
            accessor="quantity"
            backgroundColor="transparent"
            paddingLeft="20"
            absolute
          />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800)} style={styles.card}>
          <Text style={styles.subTitle}>{t('detailedBreakdown')}</Text>

          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title>{t('categoryLabel')}</DataTable.Title>
              <DataTable.Title>{t('productLabel')}</DataTable.Title>
              <DataTable.Title numeric>{t('quantityLabel')}</DataTable.Title>
              <DataTable.Title numeric>{t('totalPriceLabel')}</DataTable.Title>
            </DataTable.Header>

            {salesData.map((item, index) => (
              <DataTable.Row key={index} style={styles.tableRow}>
                <DataTable.Cell>{item.category}</DataTable.Cell>
                <DataTable.Cell>{item.product}</DataTable.Cell>
                <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                <DataTable.Cell numeric>₹{item.totalPrice}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#ffffffee",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  chartCard: {
    backgroundColor: "#ffffffee",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0077b6",
    textAlign: "center",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2A6F97",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#A9D6E5",
  },
  dateText: {
    fontSize: 14,
    color: "#1D3557",
  },
  tableHeader: {
    backgroundColor: "#BFDCE5",
  },
  tableRow: {
    backgroundColor: "#fff",
  },
});

export default ReportPage;
