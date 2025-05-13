import React, { useState } from "react";
import { useNavigate } from "react-router";
import { joinRoom } from "../firebase/firestore/rooms";
import Button from "../components/Button";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomId || !playerName) {
      setError("Both fields are required.");
      return;
    }

    try {
      const playerId = await joinRoom(roomId, playerName);
      localStorage.setItem("playerId", playerId);
      navigate(`/lobby/${roomId}`);
    } catch (err) {
      console.error("Error joining room:", err);
      setError("Could not join room. Check the Room ID.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-700 rounded p-12">
      <h1 className="text-3xl font-bold mb-6">Join Room</h1>
      <form onSubmit={handleJoin} className="space-y-4 w-80">
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <Button className="w-full" type="submit">
          Join
        </Button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default JoinRoom;
