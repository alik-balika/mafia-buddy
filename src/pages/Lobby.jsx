import React, { useState } from "react";
import { useParams } from "react-router";
import { Copy, Play } from "lucide-react";

import Button from "../components/Button";
import PlayerCard from "../components/PlayerCard";
import emojiJson from "../assets/emojis.json";

const Lobby = () => {
  const { roomId } = useParams();

  const getRandomEmoji = () => {
    const randomIndex = Math.floor(Math.random() * emojiJson.emojis.length);

    return emojiJson.emojis[randomIndex];
  };

  const [players, setPlayers] = useState([
    { name: "Bob", emoji: getRandomEmoji() },
    { name: "Jane", emoji: getRandomEmoji() },
    { name: "Tom", emoji: getRandomEmoji() },
    { name: "AReallyLongName", emoji: getRandomEmoji() },
    { name: "AnEvenLongerReallyLongName", emoji: getRandomEmoji() },
  ]);

  const handleEmojiClick = (name) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.name === name ? { ...player, emoji: getRandomEmoji() } : player
      )
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2">{roomId}</h1>
      <div className="flex justify-center gap-4">
        <Button
          bgColor="accent-gold"
          className="text-black font-semibold flex gap-2"
        >
          <Copy /> Copy Invite Link
        </Button>
        <Button>Leave Room</Button>
      </div>
      <div className="bg-gray-700 rounded border-1 border-primary-800 mt-4 p-6">
        <div className="flex justify-between items-center">
          <p className="font-bold text-xl">Players (N)</p>
          <Button className="flex gap-2">
            <Play /> Start Game
          </Button>
        </div>
        <p className="text-accent-gold-500 text-sm my-2 loading">
          Waiting for players (2 more needed)
        </p>
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <PlayerCard
              name={player.name}
              key={player.name}
              emoji={player.emoji}
              onEmojiClick={() => handleEmojiClick(player.name)}
            />
          ))}
        </div>
        <p className="text-sm mt-2 text-gray-300">
          Tap your emoji to change it to a random one!
        </p>
      </div>
      {/* TODO: DISPLAY ROLES IN GAME HERE. HOW? THROUGH SOME REACT STATE? QUERY PARAMS? NEED TO FIGURE IT OUT */}
    </div>
  );
};

export default Lobby;
