import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Alert, ImageBackground, KeyboardAvoidingView, Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

export default function AddProductCategory() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [products, setProducts] = useState({});
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedCategories = await AsyncStorage.getItem('categories');
      const savedProducts = await AsyncStorage.getItem('products');
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedProducts) setProducts(JSON.parse(savedProducts));
    } catch (error) {
      Alert.alert(t('error'), t('loadError'));
    }
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 50,
    });
  };

  const handleAddCategory = async () => {
    const trimmed = category.trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('error'), t('enterCategoryPlaceholder'));
      return;
    }
    if (categories.includes(trimmed)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t('error'), t('categoryExistsOrEmpty'));
      return;
    }

    const updatedCategories = [...categories, trimmed];
    const updatedProducts = { ...products, [trimmed]: [] };
    setCategories(updatedCategories);
    setProducts(updatedProducts);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    setCategory('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('success', 'Category Added', `${trimmed} added successfully`);
  };

  const handleAddProduct = async () => {
    const trimmedProduct = productName.trim();
    const trimmedCategory = selectedCategory.trim();

    if (!trimmedCategory || !trimmedProduct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('error'), t('selectCategoryAndProduct'));
      return;
    }

    const existing = products[trimmedCategory] || [];
    if (existing.includes(trimmedProduct)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t('error'), `${trimmedProduct} already exists in ${trimmedCategory}`);
      return;
    }

    const updatedProducts = {
      ...products,
      [trimmedCategory]: [...existing, trimmedProduct]
    };

    setProducts(updatedProducts);
    await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    setProductName('');
    setSelectedCategory('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('success', 'Product Added', `${trimmedProduct} added to ${trimmedCategory}`);
  };

  const handleCategorySearch = (text) => {
    setSelectedCategory(text);
    if (text.trim()) {
      const filtered = categories.filter(cat =>
        cat.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCategories(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectCategory = (item) => {
    setSelectedCategory(item);
    setShowSuggestions(false);
  };

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.card}>
            <Text style={styles.title}>{t('addCategoryTitle')}</Text>
            <TextInput
              placeholder={t('enterCategoryPlaceholder')}
              value={category}
              onChangeText={setCategory}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddCategory}>
              <Text style={styles.buttonText}>{t('addCategoryButton')}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(250)} style={styles.card}>
            <Text style={styles.title}>{t('addProductTitle')}</Text>
            <View style={styles.dropdownContainer}>
              <TextInput
                placeholder={t('searchCategoryPlaceholder')}
                value={selectedCategory}
                onChangeText={handleCategorySearch}
                style={styles.input}
                placeholderTextColor="#aaa"
              />
              {showSuggestions && filteredCategories.length > 0 && (
                <View style={styles.suggestionBox}>
                  <FlatList
                    data={filteredCategories}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectCategory(item)}>
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            <TextInput
              placeholder={t('enterProductNamePlaceholder')}
              value={productName}
              onChangeText={setProductName}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
              <Text style={styles.buttonText}>{t('addProductButton')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0077B6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%',
  },
  suggestionBox: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    zIndex: 10,
    maxHeight: 160,
  },
  suggestionItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});
