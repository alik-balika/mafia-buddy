import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getRoom } from "../firebase/firestore/rooms";
import { toast } from "react-toastify";
import { SunMoon } from "lucide-react";
import Button from "../components/Button";
import PlayerCard from "../components/PlayerCard";
import roles from "../assets/roles.json";

const GameRoom = () => {
  // LATER ON IT SHOULD LIVE UPDATE OTHER DEVICES BY SENDING A WEBHOOK. ONCE EVERYONE HAS DIED, WILL KICK OFF WEBHOOK TO SEND TO OTHER DEVICES NOTIFYING THEM
  // SHOULD ALSO HAVE A QUICK START BUTTON TO START A NEW GAME WITH THE CURRENT PLAYER LIST
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [winner, setWinner] = useState(null);

  // TODO: REWORK CURRENT NIGHT LOGIC IN THIS PAGE TO USE CURRENT NIGHT FROM THE ROOM INSTEAD
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const roomData = await getRoom(roomId);

        if (!roomData?.gameStarted) {
          toast.info("The game has not started yet.");
          return navigate(`/lobby/${roomId}`);
        }

        setRoom(roomData);
        setGameHistory(roomData.gameHistory || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const q = query(
      collection(db, "rooms", roomId, "players"),
      orderBy("alive", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      updated.sort((a, b) => {
        if (a.alive && !b.alive) return -1;
        if (!a.alive && b.alive) return 1;

        if (!a.alive && !b.alive) {
          return (a.deathTimestamp || 0) - (b.deathTimestamp || 0);
        }

        return 0;
      });

      setPlayers(updated);

      // TODO: HMMM INSTEAD OF DOING THIS, ADD A TEAM FIELD OR SOMETHING TO EACH ROLE AND MAKE IT MAFIA OR TOWN
      // WILL DEFINITELY NEED TO REWORK SOME OF THE LOGIC
      const mafiaRoles = ["mafia", "mafia godfather"];

      const aliveMafia = updated.filter(
        (p) =>
          p.alive && mafiaRoles.includes(p.role?.toLowerCase()) && !p.isNarrator
      );

      const aliveTown = updated.filter(
        (p) =>
          p.alive &&
          !mafiaRoles.includes(p.role?.toLowerCase()) &&
          !p.isNarrator
      );

      if (aliveMafia.length === 0 && aliveTown.length > 0) {
        toast.success("🎉 Town wins!");
        setWinner("town");
        updateDoc(doc(db, "rooms", roomId), { winner: "town" });
      } else if (aliveTown.length === 0 && aliveMafia.length > 0) {
        toast.success("🕵️ Mafia wins!");
        setWinner("mafia");
        updateDoc(doc(db, "rooms", roomId), { winner: "mafia" });
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  useEffect(() => {
    if (!players?.length) return;

    const storedId = localStorage.getItem("playerId")?.trim();
    const player = players.find((p) => p.id === storedId);
    if (!storedId || !player) {
      return navigate(`/lobby/${roomId}`);
    }

    if (!player.isNarrator) {
      return navigate(`/lobby/${roomId}`);
    }
  }, [players, navigate, roomId]);

  const nextNight = async () => {
    const roomRef = doc(db, "rooms", roomId);
    const newHistory = [
      ...gameHistory,
      { night: gameHistory.length + 1, deaths: [] },
    ];
    await updateDoc(roomRef, { gameHistory: newHistory });
    setGameHistory(newHistory);
  };

  const toggleAlive = async (player) => {
    const playerRef = doc(db, "rooms", roomId, "players", player.id);
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    const roomData = roomSnap.data();
    let updatedHistory = [...(roomData.gameHistory || [])];

    if (player.alive) {
      // KILL
      const currentNight = updatedHistory.length;
      if (currentNight === 0 || !updatedHistory[currentNight - 1]) {
        updatedHistory.push({ night: currentNight + 1, deaths: [player.name] });
      } else {
        if (!updatedHistory[currentNight - 1].deaths) {
          updatedHistory[currentNight - 1].deaths = [];
        }
        updatedHistory[currentNight - 1].deaths.push(player.name);
      }

      await Promise.all([
        updateDoc(playerRef, {
          alive: false,
          deathTimestamp: Date.now(),
        }),
        updateDoc(roomRef, { gameHistory: updatedHistory }),
      ]);
      setGameHistory(updatedHistory);
    } else {
      // REVIVE
      await updateDoc(playerRef, {
        alive: true,
        deathTimestamp: null,
      });
    }
  };

  const handleStartNewGame = async () => {
    const roomRef = doc(db, "rooms", roomId);
    const playerSnap = await getDocs(
      collection(db, "rooms", roomId, "players")
    );
    const batch = writeBatch(db);

    playerSnap.forEach((docSnap) => {
      const playerRef = doc(db, "rooms", roomId, "players", docSnap.id);
      batch.update(playerRef, {
        alive: true,
        deathTimestamp: null,
        role: null,
      });
    });

    batch.update(roomRef, {
      currentNight: 1,
      gameStarted: false,
      gameHistory: [],
      winner: null,
    });

    await batch.commit();
    toast.info("New game ready! Returning to lobby...");
    navigate(`/lobby/${roomId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-gold-500"></div>
          <p>Loading game room...</p>
        </div>
      </div>
    );
  }

  if (!room?.gameStarted) {
    navigate(`/lobby/${roomId}`);
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-4">{roomId}</h1>
      <div className="flex justify-center mb-4">
        <Button className="flex items-center gap-2" onClick={nextNight}>
          <SunMoon size={18} /> Next Night
        </Button>
        {winner && (
          <Button
            className="ml-2"
            onClick={handleStartNewGame}
            variant="secondary"
          >
            🔁 Start a New Game
          </Button>
        )}
      </div>

      {/* TBH I MAY END UP REDOING MOST OF THIS. BUT, WILL NEED TO ADD ROLES TO EACH PLAYER IN THE PLAYER CARD */}
      <div className="bg-gray-700 rounded p-6 shadow-md shadow-black">
        <p className="font-bold text-xl mb-2">Players ({players.length})</p>
        <div className="flex flex-col gap-2">
          {players
            .filter((player) => !player.isNarrator)
            .map((player) => {
              const matchingRole = room.rolePool.find(
                (role) => role.name === player.role
              );

              // TODO: EXTRACT THIS VILLAGER TEXT SOMEWHERE ELSE
              const roleDescription =
                matchingRole?.description ??
                (player.role === "Villager" ? roles["villager"] : undefined);

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between"
                >
                  <PlayerCard
                    name={player.name}
                    emoji={player.emoji}
                    alive={player.alive}
                    toggleAlive={() => toggleAlive(player)}
                    roleName={player.role}
                    roleDescription={roleDescription}
                  />
                </div>
              );
            })}
        </div>

        <div className="mt-6 border-t border-gray-600 pt-4">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Game History</h2>
          {gameHistory.length === 0 ? (
            <p className="text-gray-400 italic">No history yet.</p>
          ) : (
            <ul className="space-y-2">
              {gameHistory.map((night, i) => (
                <li key={i} className="border-l-2 border-accent-gold-500 pl-4">
                  <p className="text-lg font-semibold">
                    🌙 Night {night.night}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium">Players Killed:</span>{" "}
                    {night.deaths?.length ? night.deaths.join(", ") : "None"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
