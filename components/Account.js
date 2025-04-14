import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { createStackNavigator } from '@react-navigation/stack';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createStackNavigator();

const Account = ({ navigation }) => {
  const { t } = useTranslation();
  const [sellerName, setSellerName] = useState('John Doe');
  const [vehicleId, setVehicleId] = useState('AP21AR2273');
  const [driverName, setDriverName] = useState('Gray John');
  const [phoneNumber, setPhoneNumber] = useState('+91 123456789');
  const [isEditable, setIsEditable] = useState({
    name: false,
    phone: false,
    id: false,
    driver: false,
  });

  const handleSubmit = () => {
    navigation.navigate('Details', {
      sellerName,
      phoneNumber,
      vehicleId,
      driverName,
    });
  };

  const toggleEdit = (key) => {
    LayoutAnimation.easeInEaseOut();
    setIsEditable({ ...isEditable, [key]: !isEditable[key] });
  };

  return (
    <ImageBackground
      source={require('../assets/background2.png')}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>{t('sellerDetailsTitle')}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>{t('sellerIdLabel')}</Text>
            <TextInput style={[styles.input, styles.disabledInput]} editable={false} value="S12345" />
          </View>

          {[
            {
              label: t('sellerNameLabel'),
              state: sellerName,
              setState: setSellerName,
              key: 'name',
            },
            {
              label: t('phoneNumberLabel'),
              state: phoneNumber,
              setState: setPhoneNumber,
              key: 'phone',
              keyboardType: 'phone-pad',
            },
            {
              label: t('vehicleIdLabel'),
              state: vehicleId,
              setState: setVehicleId,
              key: 'id',
            },
            {
              label: t('driverNameLabel'),
              state: driverName,
              setState: setDriverName,
              key: 'driver',
            },
          ].map(({ label, state, setState, key, keyboardType }) => (
            <View key={key} style={styles.card}>
              <View style={styles.inputRow}>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity onPress={() => toggleEdit(key)}>
                  <Text style={styles.editButton}>
                    {isEditable[key] ? t('saveButton') : t('editButton')}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  isEditable[key] && styles.editableInput,
                ]}
                value={state}
                onChangeText={setState}
                editable={isEditable[key]}
                keyboardType={keyboardType || 'default'}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>{t('submitButton')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const DetailsScreen = ({ route }) => {
  const { t } = useTranslation();
  const { sellerName, phoneNumber, vehicleId, driverName } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>{t('submittedDetailsTitle')}</Text>
      <Text style={styles.detailsText}>{t('sellerNameLabel')}: {sellerName}</Text>
      <Text style={styles.detailsText}>{t('phoneNumberLabel')}: {phoneNumber}</Text>
      <Text style={styles.detailsText}>{t('vehicleIdLabel')}: {vehicleId}</Text>
      <Text style={styles.detailsText}>{t('driverNameLabel')}: {driverName}</Text>
    </ScrollView>
  );
};

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0077b6',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#ffffffee',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    fontSize: 14,
    backgroundColor: '#4B9EFF',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#666',
  },
  editableInput: {
    borderColor: '#4B9EFF',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#0077b6',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#001258',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f9ff',
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#001258',
    textAlign: 'center',
  },
  detailsText: {
    fontSize: 18,
    marginBottom: 12,
    color: '#444',
  },
});
