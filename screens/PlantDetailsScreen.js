import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getMockSensorData } from "../services/mockSensorData";

export default function PlantDetailsScreen({ route, navigation }) {
  const { plant } = route.params;
  const sensorData = getMockSensorData();
  const careReqs = plant.species.careRequirements;

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

  const moistureStatus = getHealthStatus(
    sensorData.moisture,
    careReqs?.minMoisture,
    careReqs?.maxMoisture
  );
  const lightStatus = getHealthStatus(
    sensorData.light,
    careReqs?.minLight,
    careReqs?.maxLight
  );
  const tempStatus = getHealthStatus(
    sensorData.temperature,
    careReqs?.minTemp,
    careReqs?.maxTemp
  );
  const humidityStatus = getHealthStatus(
    sensorData.humidity,
    careReqs?.minHumidity,
    careReqs?.maxHumidity
  );

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
        <Text style={styles.sectionTitle}>Current Health</Text>
        <View style={styles.healthGrid}>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>Moisture</Text>
            <Text
              style={[
                styles.healthValue,
                { color: getStatusColor(moistureStatus) },
              ]}
            >
              {sensorData.moisture}%
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
              {sensorData.light} lux
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
              {sensorData.temperature}°C
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
              {sensorData.humidity}%
            </Text>
            <Text style={styles.healthRange}>
              {careReqs
                ? `Ideal: ${careReqs.minHumidity}-${careReqs.maxHumidity}%`
                : "No data"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality</Text>
        {Object.entries(plant.traits).map(([trait, value]) => (
          <View key={trait} style={styles.traitRow}>
            <Text style={styles.traitLabel}>
              {trait.charAt(0).toUpperCase() + trait.slice(1)}
            </Text>
            <View style={styles.traitBarContainer}>
              <View style={[styles.traitBar, { width: `${value * 10}%` }]} />
            </View>
            <Text style={styles.traitValue}>{value}</Text>
          </View>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#4a7c59",
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
  traitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  traitLabel: {
    width: 90,
    fontSize: 14,
    color: "#333",
  },
  traitBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginHorizontal: 10,
  },
  traitBar: {
    height: "100%",
    backgroundColor: "#4a7c59",
    borderRadius: 4,
  },
  traitValue: {
    width: 25,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
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
