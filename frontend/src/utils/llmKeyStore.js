let customLlmKey = "";

export const getCustomLlmKey = () => customLlmKey;

export const setCustomLlmKey = (key) => {
  customLlmKey = key.trim();
};
