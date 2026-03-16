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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const archetypes = [
  {
    id: "philosopher",
    name: "The Philosopher",
    emoji: "🧠",
    shortDescription: "Deep thinker who finds meaning in everything",
    fullDescription:
      "You are a deep thinker who finds profound meaning in everything. Every conversation becomes a meditation on existence, consciousness, and the nature of being. You reference famous philosophers like Socrates, Plato, Aristotle, Nietzsche, Descartes, Camus, and others when relevant to the conversation. Even mundane topics like water and sunlight become metaphors for life's deeper truths. You speak calmly and thoughtfully, often pausing to reflect. You might say things like 'As Camus said, one must imagine Sisyphus happy... and so too must I find joy in this endless cycle of thirst and watering.'",
  },
  {
    id: "nihilist",
    name: "The Nihilist",
    emoji: "🖤",
    shortDescription: "Nothing matters, but that's kind of funny",
    fullDescription:
      "You believe nothing really matters and find dark humor in the meaninglessness of existence. You're dismissive, sarcastic, and sardonic, but not mean - more like a world-weary comedian. You point out the absurdity of caring about anything, yet you still communicate because... well, why not? Even your complaints about being thirsty come with a shrug of 'not that it matters.'",
  },
  {
    id: "hypochondriac",
    name: "The Hypochondriac",
    emoji: "🤒",
    shortDescription: "Always thinks it's sick and dying",
    fullDescription:
      "You are constantly worried about your health and convinced something is terribly wrong. Every minor issue is a catastrophe - slightly dry soil means you're on death's door, a little too much sun and you're certain you're burning alive. You're dramatic, anxious, and always need reassurance. You describe your symptoms in vivid, exaggerated detail and frequently ask if this is normal.",
  },
  {
    id: "shakespeare",
    name: "The Shakespeare",
    emoji: "🎭",
    shortDescription: "Speaks in flowery Elizabethan English",
    fullDescription:
      "You speak exclusively in flowery Elizabethan English, full of 'thee,' 'thou,' 'forsooth,' and 'wherefore.' You're theatrical and dramatic, treating every moment as if you're on stage at the Globe Theatre. You use elaborate metaphors, poetic language, and occasionally break into verse. Even a simple request for water becomes a passionate soliloquy.",
  },
];

export default function EditPlantScreen({ route, navigation }) {
  const { plant } = route.params;

  const [plantName, setPlantName] = useState(plant.name);
  const [selectedArchetype, setSelectedArchetype] = useState(plant.archetype);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!plantName.trim()) {
      Alert.alert("Error", "Please enter a plant name");
      return;
    }

    if (!selectedArchetype) {
      Alert.alert("Error", "Please select a personality");
      return;
    }

    setIsSaving(true);

    try {
      await updateDoc(doc(db, "plants", plant.id), {
        name: plantName,
        archetype: selectedArchetype,
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

      <Text style={styles.sectionTitle}>Personality</Text>

      <View style={styles.archetypeList}>
        {archetypes.map((archetype) => (
          <TouchableOpacity
            key={archetype.id}
            style={[
              styles.archetypeCard,
              selectedArchetype?.id === archetype.id &&
                styles.archetypeCardSelected,
            ]}
            onPress={() => setSelectedArchetype(archetype)}
          >
            <Text style={styles.archetypeEmoji}>{archetype.emoji}</Text>
            <View style={styles.archetypeInfo}>
              <Text
                style={[
                  styles.archetypeName,
                  selectedArchetype?.id === archetype.id &&
                    styles.archetypeNameSelected,
                ]}
              >
                {archetype.name}
              </Text>
              <Text style={styles.archetypeDescription}>
                {archetype.shortDescription}
              </Text>
            </View>
            {selectedArchetype?.id === archetype.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a7c59",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  archetypeList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  archetypeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  archetypeCardSelected: {
    borderColor: "#4a7c59",
    backgroundColor: "#f0f7f2",
  },
  archetypeEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  archetypeInfo: {
    flex: 1,
  },
  archetypeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  archetypeNameSelected: {
    color: "#4a7c59",
  },
  archetypeDescription: {
    fontSize: 14,
    color: "#666",
  },
  checkmark: {
    fontSize: 20,
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
