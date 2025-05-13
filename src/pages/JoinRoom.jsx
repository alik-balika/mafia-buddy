import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";

import { joinRoom } from "../firebase/firestore/rooms";
import Button from "../components/Button";

const JoinRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomIdParam = searchParams.get("roomId");
  const [roomId, setRoomId] = useState(roomIdParam || "");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    let errorMessage = "";
    if (!roomId) {
      errorMessage += "Room ID is required";
    }

    if (!playerName) {
      errorMessage += (errorMessage ? " and n" : "N") + "ame is required";
    }

    if (errorMessage.length > 0) {
      toast.error(errorMessage);
      return;
    }

    setLoading(true);

    try {
      const playerId = await joinRoom(roomId, playerName);
      localStorage.setItem("playerId", playerId);
      navigate(`/lobby/${roomId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-700 rounded p-12">
      <h1 className="text-3xl font-bold mb-6">Join Room</h1>
      <form onSubmit={handleJoin} className="space-y-4 w-80">
        {!roomIdParam && (
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
          />
        )}
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        {loading ? (
          <div className="flex justify-center items-center w-full py-2 rounded bg-gray-800 text-white">
            <div className="spinner-border animate-spin h-5 w-5 border-t-2 border-b-2 border-gray-400 rounded-full"></div>
          </div>
        ) : (
          <Button className="w-full" type="submit">
            Join
          </Button>
        )}
      </form>
    </div>
  );
};

export default JoinRoom;
