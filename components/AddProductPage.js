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
  LayoutAnimation,
  UIManager,
  ToastAndroid
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AddProduct({ navigation }) {
  const { t } = useTranslation();
  const [categoryQuery, setCategoryQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseList, setPurchaseList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsData, setProductsData] = useState({});
  const [editIndex, setEditIndex] = useState(-1);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  useEffect(() => {
    loadData();
    loadCategoriesAndProducts();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('purchases');
      if (data) setPurchaseList(JSON.parse(data));
    } catch {
      Alert.alert(t('error'), t('loadError'));
    }
  };

  const loadCategoriesAndProducts = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem('categories');
      const storedProducts = await AsyncStorage.getItem('products');
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedProducts) setProductsData(JSON.parse(storedProducts));
    } catch {
      Alert.alert(t('error'), t('loadError'));
    }
  };

  const saveData = async (list) => {
    try {
      await AsyncStorage.setItem('purchases', JSON.stringify(list));
    } catch {
      Alert.alert(t('error'), t('saveError'));
    }
  };

  const calculatePrice = (qty, product) => {
    if (product && qty) setPrice(qty * (product.pricePerKg || 1));
    else setPrice('');
  };

  const handleAddOrUpdate = () => {
    if (selectedProduct && quantity && price && selectedCategory) {
      const item = { name: selectedProduct.name, category: selectedCategory, quantity, price };
      let updatedList = [...purchaseList];
      if (editIndex >= 0) {
        updatedList[editIndex] = item;
        setEditIndex(-1);
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        updatedList.push(item);
      }
      setPurchaseList(updatedList);
      saveData(updatedList);
      resetFields();

      ToastAndroid.showWithGravity(
        editIndex >= 0 ? 'Product Updated Successfully!' : 'Product Added Successfully!',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      Alert.alert(t('error'), t('missingFields'));
    }
  };

  const resetFields = () => {
    setProductQuery('');
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    Keyboard.dismiss();
  };

  const handleEdit = (index) => {
    const item = purchaseList[index];
    setProductQuery(item.name);
    setSelectedProduct(item);
    setQuantity(item.quantity.toString());
    setPrice(item.price.toString());
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedList = [...purchaseList];
            updatedList.splice(index, 1);
            setPurchaseList(updatedList);
            saveData(updatedList);
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    try {
      const previousData = await AsyncStorage.getItem('submittedData');
      let parsedData = previousData ? JSON.parse(previousData) : [];
      parsedData = [...parsedData, ...purchaseList];
      await AsyncStorage.setItem('submittedData', JSON.stringify(parsedData));
      setPurchaseList([]);
      await AsyncStorage.removeItem('purchases');
      navigation.navigate('List');
    } catch {
      Alert.alert(t('error'), t('submitError'));
    }
  };

  const filteredCategories = categoryQuery.length > 0
    ? [...new Set(categories.filter(c => c.toLowerCase().includes(categoryQuery.toLowerCase())))]
    : categories;

  const filteredProducts = selectedCategory
    ? [...new Set((productsData[selectedCategory] || [])
        .filter(p => typeof p === 'string' && p.toLowerCase().includes(productQuery.toLowerCase())))]
    : [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}
    >
      <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
        <View style={styles.container}>
          <Text style={styles.heading}>{t('addPurchasedProductsTitle')}</Text>

          <Text style={styles.label}>{t('searchCategoryLabel')}</Text>
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
          {categoryQuery.length > 0 && showCategorySuggestions && (
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item}
              style={styles.suggestionBox}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
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
              <Text style={styles.label}>{t('searchProductLabel')}</Text>
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
              {productQuery.length > 0 && showProductSuggestions && (
                <FlatList
                  data={filteredProducts}
                  keyExtractor={(item) => item}
                  style={styles.suggestionBox2}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {
                      setProductQuery(item);
                      setSelectedProduct({ name: item });
                      setShowProductSuggestions(false);
                      Keyboard.dismiss();
                    }}>
                      <Text style={styles.suggestion}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              <Text style={styles.label}>{t('quantityLabel')}</Text>
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

              <Text style={styles.totalPrice}>{t('totalPriceLabel')} ₹{price}</Text>

              <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdate}>
                <Text style={styles.addButtonText}>{editIndex >= 0 ? t('updateButton') : t('addButton')}</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.heading1}>{t('purchaseListTitle')}</Text>
          <FlatList
            data={purchaseList}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.card}>
                <Text style={styles.cardText}>{t('productLabel')}: {item.name}</Text>
                <Text style={styles.cardText}>{t('quantityLabel')}: {item.quantity} kg</Text>
                <Text style={styles.cardText}>{t('priceLabel')}: ₹{item.price}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(index)}>
                    <Text style={styles.buttonText}>{t('editButton')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(index)}>
                    <Text style={styles.buttonText}>{t('deleteButton')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            style={styles.purchaseList}
          />

          {purchaseList.length > 0 && (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.addButtonText}>{t('submitButton')}</Text>
            </TouchableOpacity>
          )}
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
    marginVertical: 0,
  },
  heading1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 0,
  },
  label: {
    color: 'black',
    marginTop:10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  suggestionBox: {
    position: 'absolute',
    top: 138,
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
    top: 227,
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
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalPrice: {
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
    fontWeight: '600',
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
