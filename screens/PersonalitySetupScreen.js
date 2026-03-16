import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

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

export default function PersonalitySetupScreen({ route, navigation }) {
  const { plantName, species } = route.params;
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!selectedArchetype) {
      Alert.alert("Error", "Please select a personality for your plant");
      return;
    }

    setIsSaving(true);

    try {
      await addDoc(collection(db, "plants"), {
        name: plantName,
        species: species,
        archetype: selectedArchetype,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });

      navigation.navigate("PlantList");
    } catch (error) {
      console.error("Error creating plant:", error);
      Alert.alert("Error", "Failed to create plant. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose a Personality</Text>
        <Text style={styles.subtitle}>
          for {plantName} ({species.display_pid})
        </Text>

        <View style={styles.archetypeList}>
          {archetypes.map((archetype) => (
            <TouchableOpacity
              key={archetype.id}
              style={[
                styles.archetypeCard,
                selectedArchetype?.id === archetype.id && styles.archetypeCardSelected,
              ]}
              onPress={() => setSelectedArchetype(archetype)}
            >
              <Text style={styles.archetypeEmoji}>{archetype.emoji}</Text>
              <View style={styles.archetypeInfo}>
                <Text style={styles.archetypeName}>{archetype.name}</Text>
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
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, isSaving && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Plant</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    color: "#4a7c59",
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    fontStyle: "italic",
  },
  archetypeList: {
    gap: 12,
  },
  archetypeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  archetypeCardSelected: {
    borderColor: "#4a7c59",
    backgroundColor: "#e8f5e9",
  },
  archetypeEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  archetypeInfo: {
    flex: 1,
  },
  archetypeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  archetypeDescription: {
    fontSize: 14,
    color: "#666",
  },
  checkmark: {
    fontSize: 24,
    color: "#4a7c59",
    fontWeight: "bold",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  createButton: {
    backgroundColor: "#4a7c59",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
