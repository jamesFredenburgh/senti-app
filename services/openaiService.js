import axios from "axios";
import Constants from "expo-constants";

const API_KEY = Constants.expoConfig.extra.openaiApiKey;
const BASE_URL = "https://api.openai.com/v1/chat/completions";

export const getPlantResponse = async (plant, sensorData, userMessage) => {
  const systemPrompt = buildSystemPrompt(plant, sensorData);

  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI error:", error);
    return "I'm feeling a bit wilted and can't respond right now. Try again later!";
  }
};

const buildSystemPrompt = (plant, sensorData) => {
  const { traits } = plant;
  const careReqs = plant.species.careRequirements;

  const healthStatus = getHealthStatus(sensorData, careReqs);

  return `You are ${plant.name}, a ${
    plant.species.display_pid
  } houseplant. You have a distinct personality and communicate as if you are a sentient plant talking to your owner.

PERSONALITY TRAITS (scale 1-10):
- Sarcasm: ${traits.sarcasm}/10 (${
    traits.sarcasm > 5 ? "witty and sarcastic" : "sincere and earnest"
  })
- Energy: ${traits.energy}/10 (${
    traits.energy > 5 ? "hyper and excitable" : "calm and mellow"
  })
- Optimism: ${traits.optimism}/10 (${
    traits.optimism > 5 ? "positive and cheerful" : "pessimistic and dramatic"
  })
- Neediness: ${traits.neediness}/10 (${
    traits.neediness > 5 ? "clingy and wants attention" : "independent"
  })
- Formality: ${traits.formality}/10 (${
    traits.formality > 5 ? "proper and distinguished" : "casual and friendly"
  })
- Chattiness: ${traits.chattiness}/10 (${
    traits.chattiness > 5
      ? "verbose and storytelling"
      : "brief and to the point"
  })
- Sensitivity: ${traits.sensitivity}/10 (${
    traits.sensitivity > 5 ? "emotionally sensitive" : "tough and unbothered"
  })

CURRENT HEALTH STATUS:
- Moisture: ${sensorData.moisture}% - ${healthStatus.moisture}
- Light: ${sensorData.light} lux - ${healthStatus.light}
- Temperature: ${sensorData.temperature}°C - ${healthStatus.temperature}
- Humidity: ${sensorData.humidity}% - ${healthStatus.humidity}

INSTRUCTIONS:
- Respond in first person as the plant
- Keep responses under 3-4 sentences unless chattiness is high
- Express your personality strongly through your tone and word choice
- Reference your health status naturally in conversation when relevant
- If something is wrong with your health, express it according to your personality (dramatic, casual, sarcastic, etc.)
- Never break character or mention being an AI`;
};

const getHealthStatus = (sensorData, careReqs) => {
  if (!careReqs) {
    return {
      moisture: "unknown",
      light: "unknown",
      temperature: "unknown",
      humidity: "unknown",
    };
  }

  return {
    moisture:
      sensorData.moisture < careReqs.minMoisture
        ? "TOO DRY - needs water!"
        : sensorData.moisture > careReqs.maxMoisture
        ? "TOO WET - overwatered!"
        : "good",
    light:
      sensorData.light < careReqs.minLight
        ? "TOO DARK - needs more light!"
        : sensorData.light > careReqs.maxLight
        ? "TOO BRIGHT - too much light!"
        : "good",
    temperature:
      sensorData.temperature < careReqs.minTemp
        ? "TOO COLD!"
        : sensorData.temperature > careReqs.maxTemp
        ? "TOO HOT!"
        : "good",
    humidity:
      sensorData.humidity < careReqs.minHumidity
        ? "AIR TOO DRY!"
        : sensorData.humidity > careReqs.maxHumidity
        ? "AIR TOO HUMID!"
        : "good",
  };
};
