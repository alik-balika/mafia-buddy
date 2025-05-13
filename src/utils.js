import emojiJson from "./assets/emojis.json";

export const getRandomEmoji = () => {
  const randomIndex = Math.floor(Math.random() * emojiJson.emojis.length);

  return emojiJson.emojis[randomIndex];
};
