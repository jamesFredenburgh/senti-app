// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
// } from "react-native";
// import { useState } from "react";
// import { searchPlants } from "../services/plantbookService";

// export default function AddPlantScreen({ navigation }) {
//   const [plantName, setPlantName] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [selectedSpecies, setSelectedSpecies] = useState(null);
//   const [isSearching, setIsSearching] = useState(false);

//   const handleSearch = async (text) => {
//     setSearchQuery(text);

//     if (text.length < 3) {
//       setSearchResults([]);
//       return;
//     }

//     setIsSearching(true);
//     const results = await searchPlants(text);
//     setSearchResults(results);
//     setIsSearching(false);
//   };

//   const handleSelectSpecies = (species) => {
//     setSelectedSpecies(species);
//     setSearchQuery(species.display_pid);
//     setSearchResults([]);
//   };

//   const handleNext = () => {
//     if (!plantName || !selectedSpecies) {
//       alert("Please enter a name and select a species");
//       return;
//     }

//     navigation.navigate("PersonalitySetup", {
//       plantName: plantName,
//       species: selectedSpecies,
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Add New Plant</Text>

//       <Text style={styles.label}>Give your plant a name</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="e.g., Peter"
//         value={plantName}
//         onChangeText={setPlantName}
//       />

//       <Text style={styles.label}>Search for species</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="e.g., Monstera"
//         value={searchQuery}
//         onChangeText={handleSearch}
//       />

//       {isSearching && <ActivityIndicator style={styles.loader} />}

//       {searchResults.length > 0 && (
//         <View style={styles.resultsContainer}>
//           <FlatList
//             data={searchResults}
//             keyExtractor={(item) => item.pid}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.resultItem}
//                 onPress={() => handleSelectSpecies(item)}
//               >
//                 <Text style={styles.resultText}>{item.display_pid}</Text>
//                 {item.alias && (
//                   <Text style={styles.aliasText}>{item.alias}</Text>
//                 )}
//               </TouchableOpacity>
//             )}
//           />
//         </View>
//       )}

//       {selectedSpecies && (
//         <View style={styles.selectedContainer}>
//           <Text style={styles.selectedLabel}>Selected:</Text>
//           <Text style={styles.selectedText}>{selectedSpecies.display_pid}</Text>
//         </View>
//       )}

//       <TouchableOpacity style={styles.button} onPress={handleNext}>
//         <Text style={styles.buttonText}>Next</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles.link}>Cancel</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     paddingTop: 60,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 30,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: "#333",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 15,
//     marginBottom: 20,
//     borderRadius: 8,
//   },
//   loader: {
//     marginVertical: 10,
//   },
//   resultsContainer: {
//     maxHeight: 200,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   resultItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   resultText: {
//     fontSize: 16,
//   },
//   aliasText: {
//     fontSize: 14,
//     color: "#666",
//   },
//   selectedContainer: {
//     backgroundColor: "#e8f5e9",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   selectedLabel: {
//     fontSize: 14,
//     color: "#666",
//   },
//   selectedText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#4a7c59",
//   },
//   button: {
//     backgroundColor: "#4a7c59",
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 15,
//   },
//   buttonText: {
//     color: "white",
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   link: {
//     textAlign: "center",
//     color: "#999",
//   },
// });

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { searchPlants, getPlantDetails } from "../services/plantbookService";

export default function AddPlantScreen({ navigation }) {
  const [plantName, setPlantName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleSearch = async (text) => {
    setSearchQuery(text);

    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchPlants(text);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectSpecies = async (species) => {
    setSearchResults([]);
    setSearchQuery(species.display_pid);
    setIsLoadingDetails(true);

    // Fetch full plant details including care requirements
    const details = await getPlantDetails(species.pid);

    const speciesWithDetails = {
      ...species,
      careRequirements: details
        ? {
            minMoisture: details.min_soil_moist,
            maxMoisture: details.max_soil_moist,
            minLight: details.min_light_lux,
            maxLight: details.max_light_lux,
            minTemp: details.min_temp,
            maxTemp: details.max_temp,
            minHumidity: details.min_env_humid,
            maxHumidity: details.max_env_humid,
          }
        : null,
    };

    setSelectedSpecies(speciesWithDetails);
    setIsLoadingDetails(false);

    console.log(
      "Plant care requirements:",
      speciesWithDetails.careRequirements
    );
  };

  const handleNext = () => {
    if (!plantName || !selectedSpecies) {
      alert("Please enter a name and select a species");
      return;
    }

    navigation.navigate("PersonalitySetup", {
      plantName: plantName,
      species: selectedSpecies,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Plant</Text>

      <Text style={styles.label}>Give your plant a name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Peter"
        value={plantName}
        onChangeText={setPlantName}
      />

      <Text style={styles.label}>Search for species</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Monstera"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {isSearching && <ActivityIndicator style={styles.loader} />}

      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.pid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectSpecies(item)}
              >
                <Text style={styles.resultText}>{item.display_pid}</Text>
                {item.alias && (
                  <Text style={styles.aliasText}>{item.alias}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {isLoadingDetails && (
        <View style={styles.loadingDetails}>
          <ActivityIndicator size="small" color="#4a7c59" />
          <Text style={styles.loadingText}>Loading plant details...</Text>
        </View>
      )}

      {selectedSpecies && !isLoadingDetails && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedLabel}>Selected:</Text>
          <Text style={styles.selectedText}>{selectedSpecies.display_pid}</Text>
          {selectedSpecies.careRequirements && (
            <Text style={styles.careText}>Care requirements loaded ✓</Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Cancel</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
  },
  loader: {
    marginVertical: 10,
  },
  resultsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    fontSize: 16,
  },
  aliasText: {
    fontSize: 14,
    color: "#666",
  },
  loadingDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
  },
  selectedContainer: {
    backgroundColor: "#e8f5e9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedLabel: {
    fontSize: 14,
    color: "#666",
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a7c59",
  },
  careText: {
    fontSize: 12,
    color: "#4a7c59",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4a7c59",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#999",
  },
});
