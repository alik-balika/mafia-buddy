import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Copy, Play, Pencil } from "lucide-react";
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
import {
  changePlayerEmoji,
  removePlayerFromRoom,
  updatePlayerName,
  startGame,
  joinRoom,
} from "../firebase/firestore/rooms";

const Lobby = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [emojiClickCooldown, setEmojiClickCooldown] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);

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

  // TODO: ADD SUPER SECRET QUERY PARAM THAT WILL ALLOW ME PERSONALLY TO ACT AS NARRATOR IN ALL LOBBIES
  // TODO: ALLOW NARRATOR TO PRE-ASSIGN ROLES IN LOBBY AND RANDOMIZE THE REST
  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setRoomData({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Room not found.");
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

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

  useEffect(() => {
    if (!players?.length) return;

    const storedId = localStorage.getItem("playerId")?.trim();
    const player = players.find((p) => p.id === storedId);
    if (!storedId || !player) {
      localStorage.removeItem("playerId");
      localStorage.removeItem("roomId");
      return navigate(`/join-room?roomId=${roomId}`);
    }

    setCurrentPlayer(player);
  }, [players, navigate, roomId]);

  useEffect(() => {
    if (!roomData || !currentPlayer) return;

    if (!roomData.gameStarted) {
      return;
    }

    setShowCountdown(true);
    setCountdownValue(3);

    const interval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          const navigateTo = currentPlayer.isNarrator
            ? "game-room"
            : "role-reveal";
          navigate(`/${navigateTo}/${roomId}`);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomData, currentPlayer, navigate, roomId]);

  const handleEmojiClick = async (clickedPlayerId) => {
    if (clickedPlayerId !== currentPlayer.id || emojiClickCooldown) return;

    setEmojiClickCooldown(true);

    try {
      await changePlayerEmoji(roomId, clickedPlayerId);
    } catch (error) {
      console.error("Failed to update emoji:", error);
    }

    setEmojiClickCooldown(false);
  };

  const numberOfRequiredPlayers = () => {
    if (!roomData || !roomData.rolePool) return 0;
    const count = roomData.rolePool.reduce((total, role) => {
      return total + role.count;
    }, 0);

    return count;
  };

  const handleLeaveRoom = async () => {
    if (!window.confirm("Are you sure you want to leave the room?")) return;

    const storedId = localStorage.getItem("playerId")?.trim();
    if (!storedId) {
      navigate("/");
      return;
    }

    try {
      await removePlayerFromRoom(roomId, storedId);
      localStorage.removeItem("playerId");
      navigate("/");
    } catch (err) {
      console.error("Failed to leave room:", err);
      toast.error("Error leaving room. Try again.");
    }
  };

  const onNameChange = async (playerId, newName) => {
    try {
      await updatePlayerName(roomId, playerId, newName);
    } catch (err) {
      console.error("Failed to update player name:", err);
      toast.error("Could not change name. Try again.");
    }
  };

  const kickPlayer = async (playerId) => {
    if (!window.confirm("Are you sure you want to kick this player?")) return;

    try {
      await removePlayerFromRoom(roomId, playerId);
    } catch (err) {
      console.error("Failed to kick player from room:", err);
      toast.error("Error kicking player. Try again.");
    }
  };

  const handleStartGame = async () => {
    if (!window.confirm("Click ok to start the game")) return;

    try {
      await startGame(roomId);

      const navigateTo = currentPlayer.isNarrator ? "game-room" : "role-reveal";
      navigate(`/${navigateTo}/${roomId}`);
    } catch (error) {
      console.error("Failed to start the game:", error);
      toast.error("There was an issue starting the game. Please try again.");
    }
  };

  if (!roomData && !currentPlayer) {
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
      <div className="flex flex-col md:flex-row md:justify-between justify-center gap-4">
        <Button
          bgColor="accent-gold"
          className="text-accent-gold-500 font-semibold flex gap-2 justify-center"
          variant="outline"
          onClick={copyLinkNotification}
        >
          <Copy /> Copy Invite Link
        </Button>
        <Button onClick={handleLeaveRoom}>Leave Room</Button>
      </div>
      <div className="bg-gray-700 rounded mt-4 p-6 shadow-md shadow-black">
        <div className="flex justify-between items-center">
          <p className="font-bold text-xl">Players ({players.length})</p>
          {currentPlayer?.isNarrator && (
            <Button
              className="flex gap-2"
              disabled={players.length < numberOfRequiredPlayers()}
              onClick={handleStartGame}
            >
              <Play /> Start Game
            </Button>
          )}
        </div>
        {/* + 1 needed here because narrator is not included */}
        {numberOfRequiredPlayers() - players.length + 1 > 0 && (
          <p className="text-accent-gold-500 text-sm my-2 loading">
            Waiting for players (
            {numberOfRequiredPlayers() - players.length + 1} more needed)
          </p>
        )}
        {currentPlayer?.isNarrator && (
          <p className="text-sm mt-2 text-accent-gold-500 font-bold">
            Narrator Tip: You can edit names by clicking on them!
          </p>
        )}
        <div className="flex flex-col gap-2 mt-4">
          {players.map((player) => (
            <PlayerCard
              name={player.name}
              key={player.id}
              emoji={player.emoji}
              onEmojiClick={() => handleEmojiClick(player.id)}
              isCurrentUser={player.id === currentPlayer?.id}
              isNarrator={currentPlayer?.isNarrator}
              onNameChange={(newName) => onNameChange(player.id, newName)}
              onKick={() => kickPlayer(player.id)}
            />
          ))}
        </div>
        <p className="text-sm mt-2 text-gray-300">
          Tap your emoji to change it to a random one!
        </p>
        {import.meta.env.VITE_NODE_ENV === "DEV" && (
          <Button
            onClick={() =>
              joinRoom(
                roomId,
                Math.random().toString(36).substring(7).toUpperCase()
              )
            }
          >
            GENERATE RANDOM PLAYER
          </Button>
        )}
        <div className="mt-3 border-t border-gray-600 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-100">
              Roles in this Game:
            </h2>
          </div>
          <ul className="space-y-1">
            {roomData?.rolePool.map((role, idx) => (
              <li key={`${role.name}-${idx}`} className="text-gray-200">
                {role.name}{" "}
                <span className="font-semibold">(x{role.count})</span>
              </li>
            ))}
          </ul>
          {currentPlayer?.isNarrator && (
            <Button
              bgColor="accent-gold"
              variant="outline"
              className="text-sm flex items-center gap-2 mt-2 w-full justify-center md:max-w-52"
              onClick={() => navigate(`/edit-room/${roomId}`)}
            >
              <Pencil size={16} /> Edit Roles
            </Button>
          )}
        </div>
      </div>
      {showCountdown && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <p className="text-2xl mb-4">Game is starting in...</p>
            <div className="text-6xl font-bold animate-pulse">
              {countdownValue}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
