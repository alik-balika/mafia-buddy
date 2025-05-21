import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { getPlayerRole } from "../firebase/firestore/rooms";
import { toast } from "react-toastify";
import roles from "../assets/roles.json";

// TODO MAKE THIS MORE OF AN ACTUAL LOOKING CARD THAT WHEN TAPPED CAN BE FLIPPED TO HIDE/REVEAL
// ALSO, ON DEATH SHOULD BE ABLE TO SEE WHAT EVERYONE ELSE IS (Hmmm... Should I do this? Idk if I want to reveal TOO much info)
// TODO: AUTO NAVIGATE TO LOBBY WHEN NARRATOR STARTS A NEW GAME
const RoleReveal = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [role, setRole] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [playerAlive, setPlayerAlive] = useState(true);
  const [isWinner, setIsWinner] = useState(null);

  useEffect(() => {
    const playerId = localStorage.getItem("playerId")?.trim();
    if (!playerId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const roomRef = doc(db, "rooms", roomId);
    const playersRef = collection(db, "rooms", roomId, "players");
    const alivePlayersQuery = query(playersRef, where("alive", "==", true));

    const unsubscribeRoom = onSnapshot(
      roomRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          toast.error("Room not found.");
          navigate("/");
          setLoading(false);
          return;
        }

        const roomData = docSnap.data();

        if (!roomData.gameStarted) {
          toast.info("The game has not started yet.");
          setLoading(false);
          return navigate(`/lobby/${roomId}`);
        }

        try {
          const assignedRole = await getPlayerRole(roomId, playerId);

          const roleFromPool = roomData.rolePool.find(
            (r) => r.name === assignedRole
          );

          const fallbackRole = {
            name: assignedRole,
            description:
              assignedRole === "Villager"
                ? roles["villager"]
                : "No description available.",
          };

          setRoom(roomData);
          setRole(roleFromPool || fallbackRole);

          if (roomData.winner) {
            const lowerWinner = roomData.winner.toLowerCase();
            const isMafia = ["mafia", "mafia godfather"].includes(
              (roleFromPool || fallbackRole)?.name.toLowerCase()
            );
            const isWinner =
              (lowerWinner === "mafia" && isMafia) ||
              (lowerWinner === "town" && !isMafia);
            setIsWinner(isWinner);
          }
        } catch (err) {
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error("Failed to listen to room updates: " + error.message);
        setLoading(false);
      }
    );

    const unsubscribeAlivePlayers = onSnapshot(
      alivePlayersQuery,
      (snapshot) => {
        const alive = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlivePlayers(alive);
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeAlivePlayers();
    };
  }, [roomId, navigate]);

  useEffect(() => {
    const playerId = localStorage.getItem("playerId")?.trim();
    if (!playerId) return;

    const playerDocRef = doc(db, "rooms", roomId, "players", playerId);

    const unsubscribePlayer = onSnapshot(playerDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const playerData = docSnap.data();
        setPlayerAlive(playerData.alive);
      }
    });

    return () => unsubscribePlayer();
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
    return null;
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

  // TODO: ONCE A PLAYER HAS DIED, SHOW THEM THE DEATH LIST.
  // ADD AN EXCEPTION FOR THE REVIVOR ROLE. IF THAT ROLE IS STILL ALIVE, DO NOT SHOW DEATH LIST
  // UNTIL THE REVIVOR IS DEAD
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Your Role</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
        <p className="text-xl font-bold mb-2">{role.name}</p>
        <p className="text-gray-300 text-sm">{role.description}</p>
      </div>
      {!playerAlive && (
        <div className="mt-6 p-4 bg-red-900 rounded text-white">
          You are dead.
          {/* TODO: FIGURE OUT IF I SHOULD DISPLAY THE DEAD PLAYERS AND THEIR ROLES. ALSO, THIS UI SUCKS LOL. FUNCTIONAL FOR NOW */}
        </div>
      )}
      {isWinner !== null && (
        <div
          className={`mt-6 p-4 rounded text-white ${
            isWinner ? "bg-green-700" : "bg-red-800"
          }`}
        >
          {isWinner ? "🎉 You won!" : "😢 You lost!"}
        </div>
      )}
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
