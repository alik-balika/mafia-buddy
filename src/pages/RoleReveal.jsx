import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import Confetti from "react-confetti";

import { db } from "../firebase/firebase";
import { getPlayer } from "../firebase/firestore/rooms";
import { toast } from "react-toastify";

// TODO: ALSO, ON DEATH SHOULD BE ABLE TO SEE WHAT EVERYONE ELSE IS (Hmmm... Should I do this? Idk if I want to reveal TOO much info)
const RoleReveal = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [isWinner, setIsWinner] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const roleEmoji = "🎭";

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
          setLoading(false);
          return navigate(`/lobby/${roomId}`);
        }

        try {
          const playerData = await getPlayer(roomId, playerId);
          setRoom(roomData);

          const roleFromPool = roomData.rolePool.find(
            (r) => r.name === playerData.role
          );

          playerData.role = roleFromPool;
          setPlayer(playerData);

          if (roomData.winner === roleFromPool.team) {
            setIsWinner(true);
          } else if (roomData.winner && roomData.winner !== roleFromPool.team) {
            setIsWinner(false);
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

  if (!player.role) {
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
  // ADD AN EXCEPTION FOR THE REVIVOR ROLE. IF THAT ROLE IS STILL ALIVE, DO NOT SHOW DEATH LIST UNTIL THE REVIVOR IS DEAD
  return (
    <div className="flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl font-bold mb-4">Your Role</h1>
      <div
        className="relative w-64 h-96 perspective"
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style preserve-3d transition-transform ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-gray-700 text-white rounded-xl shadow-lg flex items-center justify-center px-4">
            <div className="text-center space-y-2">
              <p className="text-4xl">{roleEmoji}</p>
              <p className="text-base">Tap to reveal</p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gray-700 text-white rounded-xl shadow-lg transform rotate-y-180 flex flex-col items-center justify-center px-4 py-6">
            <p className="text-2xl font-bold">{player.role.name}</p>
            <p className="text-sm text-center text-gray-300">
              {player.role.description}
            </p>
            {player.role.name === "Executioner" && player.target && (
              <div className="mt-4 p-3 bg-zinc-800 rounded-lg border border-accent-gold-500 text-accent-gold-300 text-sm text-center">
                🎯 Your target is <strong>{player.target}</strong>.<br />
                You win if they are voted out.
                <p className="mt-4">
                  <small>
                    Note, you do not win if they die at night. They must be
                    voted out.
                  </small>
                </p>
              </div>
            )}
            <p className="mt-4 text-xs text-gray-400">Tap to hide</p>
          </div>
        </div>
      </div>

      {!player.alive && (
        <div className="mt-8 p-6 bg-red-800 text-white rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">💀 You have died</h2>
          <p className="text-sm text-gray-200">
            You can no longer participate in the game. Sit back and watch the
            rest unfold.
          </p>
        </div>
      )}
      {isWinner !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white text-center fade-in-soft">
          {isWinner && (
            <>
              <h1 className="text-4xl font-bold mb-2">🎉 Victory</h1>
              <p className="text-gray-300 mb-6">Your team has won the game.</p>
              <Confetti numberOfPieces={100} recycle={true} />
            </>
          )}
          {!isWinner && (
            <>
              <h1 className="text-4xl font-bold mb-2">Defeat</h1>
              <p className="text-gray-400 mb-6">
                You lost. Better luck next time.
              </p>
            </>
          )}
          <p className="mt-6 text-sm text-gray-500">
            Waiting for the narrator to start a new game...
          </p>
        </div>
      )}
      <div className="mt-8 text-center w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Players Still Alive</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-sm mx-auto">
          {alivePlayers
            .filter((player) => !player.isNarrator)
            .map((player) => (
              <li
                key={player.id}
                className="bg-gray-700 p-2 rounded-lg flex flex-col items-center text-sm text-white"
              >
                <span className="text-xl">{player.emoji || "🧑"}</span>
                <span>{player.name}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default RoleReveal;
