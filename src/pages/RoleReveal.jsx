import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { getRoom, getPlayerRole } from "../firebase/firestore/rooms";
import { toast } from "react-toastify";

// TODO MAKE THIS MORE OF AN ACTUAL LOOKING CARD THAT WHEN TAPPED CAN BE FLIPPED TO HIDE/REVEAL
// ALSO, ON DEATH SHOULD BE ABLE TO SEE WHAT EVERYONE ELSE IS
const RoleReveal = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [role, setRole] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alivePlayers, setAlivePlayers] = useState([]);

  useEffect(() => {
    const playerId = localStorage.getItem("playerId").trim();

    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomData, assignedRole] = await Promise.all([
          getRoom(roomId),
          getPlayerRole(roomId, playerId),
        ]);

        if (!roomData?.gameStarted) {
          toast.info("The game has not started yet.");
          setLoading(false);
          return;
        }

        const roleFromPool = roomData.rolePool.find(
          (r) => r.name === assignedRole
        );

        setRoom(roomData);
        setRole(roleFromPool);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const playersRef = collection(db, "rooms", roomId, "players");
    const q = query(playersRef, where("alive", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alive = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlivePlayers(alive);
    });

    return () => unsubscribe();
  }, [roomId]);

  // TODO: MAKE THIS PAGE MORE SEXY
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-gold-500"></div>
          <p>Loading role...</p>
        </div>
      </div>
    );
  }

  if (!room?.gameStarted) {
    navigate(`/lobby/${roomId}`);
  }

  if (!role) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-center">
        <p>
          No role found for this player in this room.
          <br />
          Make sure the game has started and you're in the right room.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Your Role</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
        <p className="text-xl font-bold mb-2">{role.name}</p>
        <p className="text-gray-300 text-sm">{role.description}</p>
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Players Still Alive:</h2>
        <ul className="space-y-1 text-gray-300">
          {alivePlayers.map((player) => (
            <li key={player.id}>🟢 {player.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoleReveal;
