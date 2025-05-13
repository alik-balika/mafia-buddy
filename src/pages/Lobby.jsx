import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Copy, Play } from "lucide-react";

import Button from "../components/Button";
import PlayerCard from "../components/PlayerCard";
import emojiJson from "../assets/emojis.json";
import { getRoom } from "../firebase/firestore/rooms";

const Lobby = () => {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      const data = await getRoom(roomId);
      if (data) {
        setRoomData(data);
      }
    };

    fetchRoom();
  }, [roomId]);

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

  const selectedRoles = [
    {
      name: "Mafia",
      description:
        "Works with other Mafia members to eliminate all non-mafia players",
      count: 3,
    },
    {
      name: "Angel",
      description:
        "Can protect one person from being killed each night (even themselves)",
      count: 1,
    },
    {
      name: "Detective",
      description:
        "Can investigate one person each night to detmine if they are a Mafia",
      count: 1,
    },
  ];

  const handleEmojiClick = (name) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.name === name ? { ...player, emoji: getRandomEmoji() } : player
      )
    );
  };

  if (!roomData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2">{roomId}</h1>
      <div className="flex justify-center gap-4">
        <Button
          bgColor="accent-gold"
          className="text-accent-gold-500 font-semibold flex gap-2"
          variant="outline"
        >
          <Copy /> Copy Invite Link
        </Button>
        <Button>Leave Room</Button>
      </div>
      <div className="bg-gray-700 rounded mt-4 p-6 shadow-md shadow-black">
        <div className="flex justify-between items-center">
          <p className="font-bold text-xl">Players (N)</p>
          {/* TODO: fix this disabled logic and player count logic */}
          {/* Only narrator should see this button */}
          <Button className="flex gap-2" disabled={players.length < 10}>
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
        <div className="mt-3 border-t border-gray-600 pt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-100">
            Roles in this Game:
          </h2>
          <ul className="space-y-1">
            {roomData.rolePool.map((role, idx) => (
              <li key={`${role.name}-${idx}`} className="text-gray-200">
                {role.name}{" "}
                <span className="font-semibold">(x{role.count})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
