import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { getPlantResponse } from "../services/openaiService";
import { getMockSensorData } from "../services/mockSensorData";

export default function ChatScreen({ route, navigation }) {
  const { plant } = route.params;
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: `Hey there! I'm ${plant.name}. How can I help you today?`,
      sender: "plant",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Get mock sensor data
    const sensorData = getMockSensorData();

    // Get plant response from OpenAI
    const response = await getPlantResponse(plant, sensorData, inputText);

    const plantMessage = {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: "plant",
    };

    setMessages((prev) => [...prev, plantMessage]);
    setIsLoading(false);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userBubble : styles.plantBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user" ? styles.userText : styles.plantText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plant.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4a7c59" />
          <Text style={styles.loadingText}>{plant.name} is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={`Message ${plant.name}...`}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    color: "#4a7c59",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 50,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: "#4a7c59",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  plantBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  plantText: {
    color: "#333",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#4a7c59",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 10,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
