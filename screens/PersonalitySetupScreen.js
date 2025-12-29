import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";
import Slider from "@react-native-community/slider";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

export default function PersonalitySetupScreen({ route, navigation }) {
  const { plantName, species } = route.params;

  const [traits, setTraits] = useState({
    sarcasm: 5,
    energy: 5,
    optimism: 5,
    neediness: 5,
    formality: 5,
    chattiness: 5,
    sensitivity: 5,
  });

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

  const handleDone = async () => {
    try {
      const plantData = {
        name: plantName,
        species: {
          pid: species.pid,
          display_pid: species.display_pid,
          alias: species.alias || null,
          careRequirements: species.careRequirements || null,
        },
        traits: traits,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "plants"), plantData);

      console.log("Plant saved successfully!", plantData);
      navigation.navigate("PlantList");
    } catch (error) {
      console.error("Error saving plant:", error);
      alert("Failed to save plant. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Set Personality</Text>
      <Text style={styles.subtitle}>How should {plantName} behave?</Text>

      <TouchableOpacity style={styles.randomButton} onPress={randomizeTraits}>
        <Text style={styles.randomButtonText}>🎲 Randomize</Text>
      </TouchableOpacity>

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

      <TouchableOpacity style={styles.button} onPress={handleDone}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  randomButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  randomButtonText: {
    fontSize: 16,
    color: "#333",
  },
  sliderContainer: {
    marginBottom: 25,
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
  button: {
    backgroundColor: "#4a7c59",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#999",
    marginBottom: 20,
  },
  bottomPadding: {
    height: 50,
  },
});
