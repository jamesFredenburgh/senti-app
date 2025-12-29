import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EditPlantScreen({ route, navigation }) {
  const { plant } = route.params;

  const [plantName, setPlantName] = useState(plant.name);
  const [traits, setTraits] = useState(plant.traits);
  const [isSaving, setIsSaving] = useState(false);

  const traitLabels = {
    sarcasm: { low: "Sincere", high: "Sarcastic" },
    energy: { low: "Calm", high: "Hyper" },
    optimism: { low: "Pessimistic", high: "Optimistic" },
    neediness: { low: "Independent", high: "Clingy" },
    formality: { low: "Casual", high: "Formal" },
    chattiness: { low: "Brief", high: "Verbose" },
    sensitivity: { low: "Tough", high: "Sensitive" },
  };

  const updateTrait = (trait, value) => {
    setTraits((prev) => ({
      ...prev,
      [trait]: Math.round(value),
    }));
  };

  const randomizeTraits = () => {
    setTraits({
      sarcasm: Math.floor(Math.random() * 10) + 1,
      energy: Math.floor(Math.random() * 10) + 1,
      optimism: Math.floor(Math.random() * 10) + 1,
      neediness: Math.floor(Math.random() * 10) + 1,
      formality: Math.floor(Math.random() * 10) + 1,
      chattiness: Math.floor(Math.random() * 10) + 1,
      sensitivity: Math.floor(Math.random() * 10) + 1,
    });
  };

  const handleSave = async () => {
    if (!plantName.trim()) {
      Alert.alert("Error", "Please enter a plant name");
      return;
    }

    setIsSaving(true);

    try {
      await updateDoc(doc(db, "plants", plant.id), {
        name: plantName,
        traits: traits,
      });

      console.log("Plant updated successfully!");

      navigation.goBack();
    } catch (error) {
      console.error("Error updating plant:", error);
      Alert.alert("Error", "Failed to update plant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Edit {plant.name}</Text>

      <Text style={styles.label}>Plant Name</Text>
      <TextInput
        style={styles.input}
        value={plantName}
        onChangeText={setPlantName}
        placeholder="Enter plant name"
      />

      <View style={styles.speciesInfo}>
        <Text style={styles.speciesLabel}>Species</Text>
        <Text style={styles.speciesText}>{plant.species.display_pid}</Text>
        <Text style={styles.speciesNote}>Species cannot be changed</Text>
      </View>

      <View style={styles.personalitySection}>
        <View style={styles.personalityHeader}>
          <Text style={styles.sectionTitle}>Personality</Text>
          <TouchableOpacity
            style={styles.randomButton}
            onPress={randomizeTraits}
          >
            <Text style={styles.randomButtonText}>🎲 Randomize</Text>
          </TouchableOpacity>
        </View>

        {Object.keys(traits).map((trait) => (
          <View key={trait} style={styles.sliderContainer}>
            <Text style={styles.traitName}>
              {trait.charAt(0).toUpperCase() + trait.slice(1)}
            </Text>
            <View style={styles.labelRow}>
              <Text style={styles.labelLow}>{traitLabels[trait].low}</Text>
              <Text style={styles.labelHigh}>{traitLabels[trait].high}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              value={traits[trait]}
              onValueChange={(value) => updateTrait(trait, value)}
              minimumTrackTintColor="#4a7c59"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#4a7c59"
            />
            <Text style={styles.value}>{traits[trait]}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
  },
  speciesInfo: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  speciesLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  speciesText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  speciesNote: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  personalitySection: {
    paddingHorizontal: 20,
  },
  personalityHeader: {
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
  randomButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  randomButtonText: {
    fontSize: 14,
    color: "#333",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  traitName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  labelLow: {
    fontSize: 12,
    color: "#666",
  },
  labelHigh: {
    fontSize: 12,
    color: "#666",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  value: {
    textAlign: "center",
    fontSize: 16,
    color: "#4a7c59",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4a7c59",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 50,
  },
});
