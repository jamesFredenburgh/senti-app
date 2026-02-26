import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { requestSensorRead } from "../services/plantbookService";

const formatLastUpdated = (timestamp) => {
  if (!timestamp) return null;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  return date.toLocaleDateString();
};

export default function PlantDetailsScreen({ route, navigation }) {
  const { plant: initialPlant } = route.params;
  const [plant, setPlant] = useState(initialPlant);
  const [refreshing, setRefreshing] = useState(false);
  const [fakeLux, setFakeLux] = useState(() => Math.floor(Math.random() * 2500) + 500);
  const sensorData = plant.sensorData;
  const careReqs = plant.species?.careRequirements;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "plants", initialPlant.id),
      (doc) => {
        if (doc.exists()) {
          setPlant({ id: doc.id, ...doc.data() });
        }
      }
    );

    return () => unsubscribe();
  }, [initialPlant.id]);

  useEffect(() => {
    if (sensorData?.lastUpdated) {
      setFakeLux(Math.floor(Math.random() * 2500) + 500);
    }
  }, [sensorData?.lastUpdated]);

  const handleUpdateSensors = async () => {
    setRefreshing(true);
    try {
      await requestSensorRead(plant.id);
      setTimeout(() => setRefreshing(false), 3000);
    } catch (error) {
      console.error("Error requesting sensor read:", error);
      Alert.alert("Error", "Failed to request sensor reading. Please try again.");
      setRefreshing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Plant",
      `Are you sure you want to delete ${plant.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "plants", plant.id));
              navigation.navigate("PlantList");
            } catch (error) {
              console.error("Error deleting plant:", error);
              alert("Failed to delete plant. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate("EditPlant", { plant });
  };

  const getHealthStatus = (current, min, max) => {
    if (min === undefined || max === undefined) return "unknown";
    if (current < min) return "low";
    if (current > max) return "high";
    return "good";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "#4a7c59";
      case "low":
      case "high":
        return "#c0392b";
      default:
        return "#666";
    }
  };

  const moistureStatus = sensorData
    ? getHealthStatus(sensorData.moisture, careReqs?.minMoisture, careReqs?.maxMoisture)
    : "unknown";
  const lightStatus = getHealthStatus(
    fakeLux,
    careReqs?.minLight,
    careReqs?.maxLight
  );
  const tempStatus = sensorData
    ? getHealthStatus(sensorData.temperature, careReqs?.minTemp, careReqs?.maxTemp)
    : "unknown";
  const humidityStatus = sensorData
    ? getHealthStatus(sensorData.humidity, careReqs?.minHumidity, careReqs?.maxHumidity)
    : "unknown";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainInfo}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.species}>{plant.species.display_pid}</Text>
        {plant.species.alias && (
          <Text style={styles.alias}>{plant.species.alias}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality</Text>
        <View style={styles.archetypeDisplay}>
          <Text style={styles.archetypeEmoji}>{plant.archetype?.emoji}</Text>
          <View style={styles.archetypeInfo}>
            <Text style={styles.archetypeName}>{plant.archetype?.name}</Text>
            <Text style={styles.archetypeDescription}>
              {plant.archetype?.shortDescription}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Health</Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateSensors}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Sensors</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.healthGrid}>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Moisture</Text>
            <Text
              style={[
                styles.healthValue,
                { color: getStatusColor(moistureStatus) },
              ]}
            >
              {sensorData ? `${sensorData.moisture}%` : "--"}
            </Text>
            <Text style={styles.healthRange}>
              {careReqs
                ? `Ideal: ${careReqs.minMoisture}-${careReqs.maxMoisture}%`
                : "No data"}
            </Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Light</Text>
            <Text
              style={[
                styles.healthValue,
                { color: getStatusColor(lightStatus) },
              ]}
            >
              {fakeLux} lux
            </Text>
            <Text style={styles.healthRange}>
              {careReqs
                ? `Ideal: ${careReqs.minLight}-${careReqs.maxLight}`
                : "No data"}
            </Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Temperature</Text>
            <Text
              style={[
                styles.healthValue,
                { color: getStatusColor(tempStatus) },
              ]}
            >
              {sensorData ? `${sensorData.temperature}°C` : "--"}
            </Text>
            <Text style={styles.healthRange}>
              {careReqs
                ? `Ideal: ${careReqs.minTemp}-${careReqs.maxTemp}°C`
                : "No data"}
            </Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Humidity</Text>
            <Text
              style={[
                styles.healthValue,
                { color: getStatusColor(humidityStatus) },
              ]}
            >
              {sensorData ? `${sensorData.humidity}%` : "--"}
            </Text>
            <Text style={styles.healthRange}>
              {careReqs
                ? `Ideal: ${careReqs.minHumidity}-${careReqs.maxHumidity}%`
                : "No data"}
            </Text>
          </View>
        </View>
        {sensorData?.lastUpdated && (
          <Text style={styles.lastUpdated}>
            Updated {formatLastUpdated(sensorData.lastUpdated)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("Chat", { plant })}
      >
        <Text style={styles.chatButtonText}>Talk to {plant.name}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>Edit Plant</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Plant</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    color: "#4a7c59",
    fontSize: 16,
  },
  mainInfo: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  plantName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  species: {
    fontSize: 18,
    color: "#666",
    fontStyle: "italic",
  },
  alias: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a7c59",
  },
  updateButton: {
    backgroundColor: "#4a7c59",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
  },
  archetypeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
  },
  archetypeEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  archetypeInfo: {
    flex: 1,
  },
  archetypeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  archetypeDescription: {
    fontSize: 14,
    color: "#666",
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  healthItem: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  healthLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  healthRange: {
    fontSize: 10,
    color: "#999",
    marginTop: 5,
  },
  chatButton: {
    backgroundColor: "#4a7c59",
    margin: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c0392b",
  },
  deleteButtonText: {
    color: "#c0392b",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 30,
  },
});
