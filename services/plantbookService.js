import axios from "axios";

// Use local backend instead of external PlantBook API
const BASE_URL = "http://192.168.0.101:3000/api";

// Search for plants by name
export const searchPlants = async (searchText) => {
  try {
    const response = await axios.get(`${BASE_URL}/plants/search`, {
      params: { query: searchText },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching plants:", error);
    return [];
  }
};

// Get detailed info for a specific plant
export const getPlantDetails = async (plantId) => {
  try {
    const response = await axios.get(`${BASE_URL}/plants/${plantId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting plant details:", error);
    return null;
  }
};

// Request an on-demand sensor reading via MQTT
export const requestSensorRead = async (plantId) => {
  const response = await axios.post(`${BASE_URL}/plants/${plantId}/read`);
  return response.data;
};
