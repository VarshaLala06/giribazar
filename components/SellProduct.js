import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SellProduct({ navigation }) {
  const { t } = useTranslation(); // Use translation hook
  const [categoryQuery, setCategoryQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [productsData, setProductsData] = useState({});
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  useEffect(() => {
    loadCategoriesAndProducts();
  }, []);

  const loadCategoriesAndProducts = async () => {
    try {
      const storedData = await AsyncStorage.getItem('submittedData');
      if (!storedData) return;

      const parsedData = JSON.parse(storedData);
      const categorySet = new Set();
      const productMap = {};

      parsedData.forEach((item) => {
        if (item.category && item.category !== 'Uncategorized') {
          categorySet.add(item.category);

          if (!productMap[item.category]) {
            productMap[item.category] = [];
          }

          productMap[item.category].push({
            name: item.name,
            pricePerKg: item.pricePerUnit,
            quantity: item.quantity,
          });
        }
      });

      setCategories(Array.from(categorySet));
      setProductsData(productMap);
    } catch (error) {
      Alert.alert(t('error'), t('loadError'));
    }
  };

  const calculatePrice = (qty, product) => {
    if (product && qty) setPrice(qty * (product.pricePerKg || 0.9));
    else setPrice('');
  };

  const handleAddSale = async () => {
    if (!selectedProduct || !quantity || isNaN(quantity) || quantity <= 0) {
      Alert.alert(t('error'), t('invalidQuantity'));
      return;
    }

    const qtyToSell = parseFloat(quantity);
    const inventoryData = await AsyncStorage.getItem('submittedData');
    if (!inventoryData) {
      Alert.alert(t('error'), t('inventoryNotFound'));
      return;
    }

    let parsedInventory = JSON.parse(inventoryData);
    let productExists = false;
    let originalQuantity = 0;
    let updatedQuantity = 0;

    const updatedInventory = parsedInventory.map((item) => {
      if (item.name === selectedProduct.name && item.category === selectedCategory) {
        originalQuantity = item.quantity;
        if (item.quantity >= qtyToSell) {
          item.quantity -= qtyToSell;
          updatedQuantity = item.quantity;
          productExists = true;
        } else {
          Alert.alert(t('error'), t('insufficientStock'));
          return item;
        }
      }
      return item;
    });

    if (!productExists) {
      Alert.alert(t('error'), t('productNotFound'));
      return;
    }

    await AsyncStorage.setItem('submittedData', JSON.stringify(updatedInventory));

    const threshold = originalQuantity * 0.2;
    if (updatedQuantity < threshold) {
      Alert.alert(t('warning'), t('lowStockAlert', { product: selectedProduct.name, quantity: updatedQuantity }));
    }

    const saleRecord = {
      name: selectedProduct.name,
      category: selectedCategory,
      quantity: qtyToSell,
      price: price,
    };

    const storedHistory = await AsyncStorage.getItem('sellHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    history.push(saleRecord);
    await AsyncStorage.setItem('sellHistory', JSON.stringify(history));

    Alert.alert(t('success'), t('saleRecorded'));
    resetFields();
  };

  const resetFields = () => {
    setProductQuery('');
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    Keyboard.dismiss();
  };

  const filteredCategories =
    categoryQuery.length > 0
      ? categories.filter((c) => c.toLowerCase().includes(categoryQuery.toLowerCase()))
      : categories;

  const filteredProducts = selectedCategory
    ? (productsData[selectedCategory] || []).filter((p) =>
        p.name.toLowerCase().includes(productQuery.toLowerCase())
      )
    : [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "android" ? -500 : 0}
    >
      <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.heading}>{t('sellProductsTitle')}</Text>

          <Text>{t('searchCategoryLabel')}</Text>
          <TextInput
            style={styles.input}
            value={categoryQuery}
            onChangeText={(text) => {
              setCategoryQuery(text);
              setShowCategorySuggestions(true);
              setSelectedCategory(null);
              setSelectedProduct(null);
              setProductQuery('');
            }}
            placeholder={t('categoryPlaceholder')}
            onBlur={() => setShowCategorySuggestions(false)}
          />
          {showCategorySuggestions && (
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item}
              style={styles.suggestionBox}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCategoryQuery(item);
                    setSelectedCategory(item);
                    setShowCategorySuggestions(false);
                    Keyboard.dismiss();
                  }}>
                  <Text style={styles.suggestion}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {selectedCategory && (
            <>
              <Text>{t('searchProductLabel')}</Text>
              <TextInput
                style={styles.input}
                value={productQuery}
                onChangeText={(text) => {
                  setProductQuery(text);
                  setShowProductSuggestions(true);
                }}
                placeholder={t('productPlaceholder')}
                onBlur={() => setShowProductSuggestions(false)}
              />
              {showProductSuggestions && (
                <FlatList
                  data={filteredProducts}
                  keyExtractor={(item) => item.name}
                  style={styles.suggestionBox2}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setProductQuery(item.name);
                        setSelectedProduct(item);
                        setShowProductSuggestions(false);
                        Keyboard.dismiss();
                      }}>
                      <Text style={styles.suggestion}>
                        {item.name} ({t('availableLabel')} {item.quantity} kg)
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              <Text>{t('quantityLabel')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={(qty) => {
                  setQuantity(qty);
                  calculatePrice(qty, selectedProduct);
                }}
                placeholder={t('quantityPlaceholder')}
              />

              <Text>{t('totalPriceLabel')} ₹{price}</Text>

              <TouchableOpacity style={styles.addButton} onPress={handleAddSale}>
                <Text style={styles.addButtonText}>{t('sellButton')}</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('SellHistory')}>
            <Text style={styles.buttonText}>{t('viewSellHistoryButton')}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0077b6',
    marginVertical: 10,
  },
  label: {
    color: 'black',
    fontWeight: '600',
    marginTop:15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
    fontSize: 16,
  },
  suggestionBox: {
    position: 'absolute',
    top: 151,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 10,
    maxHeight: 100,
  },
  suggestionBox2: {
    position: 'absolute',
    top: 235,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 10,
    maxHeight: 100,
  },
  suggestion: {
    padding: 12,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addButton: {
    backgroundColor: '#0077B6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalPrice: {
    fontWeight: '600',
    marginTop: 8,
    color: 'black',
  },
  card: {
    backgroundColor: '#83C5BE',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#0081A7',
    padding: 10,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#E63946',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyButton:{
    backgroundColor: '#0077B6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#0077B6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  purchaseList: {
    flexGrow: 0,
    height: '40%',
  },
});