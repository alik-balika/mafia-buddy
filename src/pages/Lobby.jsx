import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Copy, Play } from "lucide-react";
import { toast } from "react-toastify";
import {
  doc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import Button from "../components/Button";
import PlayerCard from "../components/PlayerCard";
import { db } from "../firebase/firebase";
import { getRoom, changePlayerEmoji } from "../firebase/firestore/rooms";

const Lobby = () => {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [emojiClickCooldown, setEmojiClickCooldown] = useState(false);
  const copyLinkNotification = () => {
    const inviteLink = `${window.location.origin}/join-room?roomId=${roomId}`;
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast("Link has been copied!");
      })
      .catch((err) => {
        toast.error("Failed to copy the link.");
        console.log("Copy failed", err);
      });
  };
  const playerId = localStorage.getItem("playerId");

  // TODO: ADD SUPER SECRET QUERY PARAM THAT WILL ALLOW ME PERSONALLY TO ACT AS NARRATOR IN ALL LOBBIES

  useEffect(() => {
    const fetchRoom = async () => {
      const data = await getRoom(roomId);
      if (data) {
        setRoomData(data);
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);
    const playersRef = collection(roomRef, "players");

    const playersQuery = query(playersRef, orderBy("joinedAt"));

    const unsubscribe = onSnapshot(playersQuery, (snapshot) => {
      const updatedPlayers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(updatedPlayers);
    });

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  const handleEmojiClick = async (clickedPlayerId) => {
    if (clickedPlayerId !== playerId || emojiClickCooldown) return;

    setEmojiClickCooldown(true);

    try {
      const newEmoji = await changePlayerEmoji(roomId, clickedPlayerId);
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === clickedPlayerId ? { ...p, emoji: newEmoji } : p
        )
      );
    } catch (error) {
      console.error("Failed to update emoji:", error);
    }

    setEmojiClickCooldown(false);
  };

  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-gold-500"></div>
          <p>Loading lobby...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2">{roomId}</h1>
      <div className="flex justify-center gap-4">
        <Button
          bgColor="accent-gold"
          className="text-accent-gold-500 font-semibold flex gap-2"
          variant="outline"
          onClick={copyLinkNotification}
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
              key={player.id}
              emoji={player.emoji}
              onEmojiClick={() => handleEmojiClick(player.id)}
              isCurrentUser={player.id === playerId}
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
