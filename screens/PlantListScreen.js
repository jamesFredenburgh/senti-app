import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function PlantListScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "plants"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plantList = [];
      snapshot.forEach((doc) => {
        plantList.push({ id: doc.id, ...doc.data() });
      });
      setPlants(plantList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigation.navigate("Auth");
  };

  const renderListView = () => (
    <FlatList
      data={plants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.plantCard}
          onPress={() => navigation.navigate("PlantDetails", { plant: item })}
        >
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantSpecies}>{item.species.display_pid}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          No plants yet. Add your first plant!
        </Text>
      }
    />
  );

  const renderSingleView = () => {
    if (plants.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No plants yet. Add your first plant!
        </Text>
      );
    }

    const plant = plants[currentIndex];

    return (
      <View style={styles.singleContainer}>
        <View style={styles.singleCard}>
          <Text style={styles.singleName}>{plant.name}</Text>
          <Text style={styles.singleSpecies}>{plant.species.display_pid}</Text>
          {plant.species.alias && (
            <Text style={styles.singleAlias}>{plant.species.alias}</Text>
          )}

          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Personality</Text>
            {Object.entries(plant.traits).map(([trait, value]) => (
              <View key={trait} style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {trait.charAt(0).toUpperCase() + trait.slice(1)}
                </Text>
                <Text style={styles.statValue}>{value}/10</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.talkButton}
            onPress={() =>
              navigation.navigate("PlantDetails", { plant: plant })
            }
          >
            <Text style={styles.talkButtonText}>View {plant.name}</Text>
          </TouchableOpacity>
        </View>

        {plants.length > 1 && (
          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() =>
                setCurrentIndex((prev) =>
                  prev > 0 ? prev - 1 : plants.length - 1
                )
              }
            >
              <Text style={styles.navButtonText}>← Prev</Text>
            </TouchableOpacity>
            <Text style={styles.navIndicator}>
              {currentIndex + 1} / {plants.length}
            </Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() =>
                setCurrentIndex((prev) =>
                  prev < plants.length - 1 ? prev + 1 : 0
                )
              }
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a7c59" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Plants</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "list" && styles.toggleActive,
          ]}
          onPress={() => setViewMode("list")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "list" && styles.toggleTextActive,
            ]}
          >
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === "single" && styles.toggleActive,
          ]}
          onPress={() => setViewMode("single")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "single" && styles.toggleTextActive,
            ]}
          >
            Single
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "list" ? renderListView() : renderSingleView()}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddPlant")}
      >
        <Text style={styles.addButtonText}>+ Add Plant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  logout: {
    color: "#999",
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: "#4a7c59",
  },
  toggleText: {
    color: "#666",
    fontWeight: "bold",
  },
  toggleTextActive: {
    color: "white",
  },
  plantCard: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  plantName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  plantSpecies: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 16,
  },
  singleContainer: {
    flex: 1,
  },
  singleCard: {
    backgroundColor: "#f9f9f9",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  singleName: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  singleSpecies: {
    fontSize: 18,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  singleAlias: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  statsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#4a7c59",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  talkButton: {
    backgroundColor: "#4a7c59",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  talkButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    color: "#4a7c59",
    fontWeight: "bold",
  },
  navIndicator: {
    color: "#666",
  },
  addButton: {
    backgroundColor: "#4a7c59",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
