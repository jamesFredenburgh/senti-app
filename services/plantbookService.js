import axios from "axios";

const API_KEY = "0c60153e77a61e224cd6479196520f632e21fb76";
const BASE_URL = "https://open.plantbook.io/api/v1";

// Search for plants by name
export const searchPlants = async (searchText) => {
  try {
    const response = await axios.get(`${BASE_URL}/plant/search`, {
      params: { alias: searchText },
      headers: {
        Authorization: `Token ${API_KEY}`,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error searching plants:", error);
    return [];
  }
};

// Get detailed info for a specific plant
export const getPlantDetails = async (plantId) => {
  try {
    const response = await axios.get(`${BASE_URL}/plant/detail/${plantId}`, {
      headers: {
        Authorization: `Token ${API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting plant details:", error);
    return null;
  }
};
