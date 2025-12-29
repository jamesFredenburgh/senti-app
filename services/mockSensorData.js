export const getMockSensorData = () => {
  return {
    moisture: 25,
    light: 800,
    temperature: 22,
    humidity: 45,
  };
};

export const mockScenarios = {
  healthy: {
    moisture: 55,
    light: 2000,
    temperature: 22,
    humidity: 50,
  },
  needsWater: {
    moisture: 10,
    light: 2000,
    temperature: 22,
    humidity: 45,
  },
  overwatered: {
    moisture: 90,
    light: 2000,
    temperature: 22,
    humidity: 55,
  },
  tooDark: {
    moisture: 50,
    light: 200,
    temperature: 22,
    humidity: 50,
  },
  tooCold: {
    moisture: 50,
    light: 2000,
    temperature: 10,
    humidity: 50,
  },
};
