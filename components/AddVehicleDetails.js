import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const VehicleDriverForm = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [vehicleID, setVehicleID] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [dailyWages, setDailyWages] = useState("");

  const index = route.params?.index;
  const isEditMode = index !== undefined;

  useEffect(() => {
    if (isEditMode) {
      const { entry } = route.params;
      setVehicleID(entry.vehicle.vehicleID || "");
      setVehicleName(entry.vehicle.vehicleName || "");
      setVehicleCapacity(entry.vehicle.vehicleCapacity || "");
      setDriverName(entry.driver.driverName || "");
      setDriverPhone(entry.driver.driverPhone || "");
      setDriverLicense(entry.driver.driverLicense || "");
      setDailyWages(entry.driver.dailyWages || "");
    }
  }, [route.params]);

  const saveDetails = async () => {
    if (!vehicleID || !vehicleName || !vehicleCapacity || !driverName || !driverPhone || !driverLicense || !dailyWages) {
      Alert.alert(t("error"), t("fillAllFields"));
      return;
    }

    const newEntry = {
      vehicle: { vehicleID, vehicleName, vehicleCapacity },
      driver: { driverName, driverPhone, driverLicense, dailyWages },
    };

    try {
      const savedData = await AsyncStorage.getItem("vehicleDriverHistory");
      let history = savedData ? JSON.parse(savedData) : [];

      if (isEditMode) {
        history[index] = newEntry;
      } else {
        history.push(newEntry);
      }

      await AsyncStorage.setItem("vehicleDriverHistory", JSON.stringify(history));
      Alert.alert(t("success"), t("detailsSaved"));
      navigation.navigate("VehicleDriverHistory");
    } catch (error) {
      Alert.alert(t("error"), t("saveError"));
    }
  };

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t("vehicleDetailsTitle")}</Text>
          <TextInput style={styles.input} placeholder={t("vehicleIDPlaceholder")} value={vehicleID} onChangeText={setVehicleID} />
          <TextInput style={styles.input} placeholder={t("vehicleNamePlaceholder")} value={vehicleName} onChangeText={setVehicleName} />
          <TextInput
            style={styles.input}
            placeholder={t("vehicleCapacityPlaceholder")}
            value={vehicleCapacity}
            onChangeText={(text) => text.match(/^\d*$/) && setVehicleCapacity(text)}
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>{t("driverDetailsTitle")}</Text>
          <TextInput style={styles.input} placeholder={t("driverNamePlaceholder")} value={driverName} onChangeText={setDriverName} />
          <TextInput
            style={styles.input}
            placeholder={t("driverPhonePlaceholder")}
            value={driverPhone}
            onChangeText={setDriverPhone}
            keyboardType="numeric"
            maxLength={10}
          />
          <TextInput style={styles.input} placeholder={t("driverLicensePlaceholder")} value={driverLicense} onChangeText={setDriverLicense} />
          <TextInput
            style={styles.input}
            placeholder={t("dailyWagesPlaceholder")}
            value={dailyWages}
            onChangeText={(text) => text.match(/^\d*$/) && setDailyWages(text)}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveDetails}>
            <Text style={styles.saveButtonText}>
              {isEditMode ? t("updateDetails") : t("saveDetails")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const VehicleDriverHistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [searchID, setSearchID] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const savedData = await AsyncStorage.getItem("vehicleDriverHistory");
        if (savedData) setHistory(JSON.parse(savedData));
      } catch (error) {
        console.log(t("fetchError"), error);
      }
    };
    fetchHistory();
  }, []);

  const removeEntry = async (index) => {
    try {
      const updatedHistory = [...history];
      updatedHistory.splice(index, 1);
      setHistory(updatedHistory);
      await AsyncStorage.setItem("vehicleDriverHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      Alert.alert(t("error"), t("removeError"));
    }
  };

  const filteredHistory = history.filter((entry) =>
    entry.vehicle.vehicleID.toLowerCase().includes(searchID.toLowerCase())
  );

  return (
    <ImageBackground source={require("../assets/background2.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>{t("vehicleDriverHistoryTitle")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("searchVehicleIDPlaceholder")}
          value={searchID}
          onChangeText={setSearchID}
        />
        {filteredHistory.length > 0 ? (
          filteredHistory.map((entry, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("vehicleID")}:</Text> {entry.vehicle.vehicleID}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("vehicleName")}:</Text> {entry.vehicle.vehicleName}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("vehicleCapacity")}:</Text> {entry.vehicle.vehicleCapacity}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("driverName")}:</Text> {entry.driver.driverName}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("driverPhone")}:</Text> {entry.driver.driverPhone}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("driverLicense")}:</Text> {entry.driver.driverLicense}</Text>
              <Text style={styles.cardText}><Text style={styles.bold}>{t("dailyWages")}:</Text> ₹{entry.driver.dailyWages}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate("Form", { entry, index })}
                >
                  <Text style={styles.buttonText}>{t("edit")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeEntry(index)}>
                  <Text style={styles.buttonText}>{t("remove")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>{t("noData")}</Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',},
  container: { padding: 20, flexGrow: 1 },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#0077b6",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#0077B6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#f0f8ff",
    padding: 18,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 3,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
    color: "#003566",
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#48cae4",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
  },
  removeButton: {
    backgroundColor: "#e63946",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export { VehicleDriverForm, VehicleDriverHistoryScreen };
