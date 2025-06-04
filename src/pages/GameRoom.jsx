import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { toast } from "react-toastify";
import { SunMoon } from "lucide-react";
import Button from "../components/Button";
import PlayerCard from "../components/PlayerCard";

const GameRoom = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribeRoom = onSnapshot(
      roomRef,
      (snapshot) => {
        const data = snapshot.data();
        if (!data?.gameStarted) {
          toast.info("The game has not started yet.");
          return navigate(`/lobby/${roomId}`);
        }

        setRoom({ id: snapshot.id, ...data });
        setLoading(false);
      },
      (err) => {
        toast.error(err.message);
      }
    );

    return () => unsubscribeRoom();
  }, [roomId, navigate]);

  useEffect(() => {
    if (!room?.gameStarted) {
      return;
    }

    const q = query(
      collection(db, "rooms", roomId, "players"),
      orderBy("alive", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPlayers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      updatedPlayers.sort((a, b) => {
        if (a.alive && !b.alive) return -1;
        if (!a.alive && b.alive) return 1;

        if (!a.alive && !b.alive) {
          return (a.deathTimestamp || 0) - (b.deathTimestamp || 0);
        }

        return 0;
      });

      setPlayers(updatedPlayers);

      const roleMap = {};
      room.rolePool.forEach((r) => {
        roleMap[r.name.toLowerCase()] = {
          team: r.team,
          killer: r.killer,
        };
      });

      const aliveByTeam = {
        mafia: [],
        town: [],
        neutral: [],
      };

      updatedPlayers.forEach((p) => {
        if (!p.alive || p.isNarrator) return;

        const role = roleMap[p.role?.toLowerCase()];
        if (!role) return;

        aliveByTeam[role.team]?.push(p);
      });

      // TODO: FIGURE OUT THESE WIN CONDITIONS. BECAUSE IF AN ARSONIST IS STILL ALIVE FOR EXAMPLE,
      // THE GAME SHOULD KEEP ON GOING. BUT, ON THE OTHER HAND, IF A ROLE LIKE JESTER IS STILL ALIVE,
      // THE GAME SHOULD END
      let winner = null;

      const executioners = updatedPlayers.filter(
        (p) => p.role?.toLowerCase() === "executioner"
      );

      // executioners win if the players vote out their target
      // may be finicky if target is mafia but can't be bothered to figure it out atm. It works rn so let's freaking go
      for (const exe of executioners) {
        const target = updatedPlayers.find((p) => p.name === exe.target);
        if (target && !target.alive && target.diedBy === "vote") {
          toast.success(`🎯 ${exe.name} (Executioner) wins!`);
          winner = exe.name;
          updateDoc(doc(db, "rooms", roomId), { winner });
          setWinner(winner);
          return;
        }
      }

      // Town win: Mafia dead and town alive
      if (aliveByTeam.mafia.length === 0 && aliveByTeam.town.length > 0) {
        toast.success("🎉 Town wins!");
        winner = "town";
      }
      // Mafia win: Town dead and mafia alive
      else if (aliveByTeam.town.length === 0 && aliveByTeam.mafia.length > 0) {
        toast.success("🕵️ Mafia wins!");
        winner = "mafia";
      }
      // Neutral win: only neutrals left alive
      else if (
        aliveByTeam.mafia.length === 0 &&
        aliveByTeam.town.length === 0 &&
        aliveByTeam.neutral.length > 0
      ) {
        toast.success("🎭 A neutral role wins!");
        winner = "neutral";
      }

      if (winner) {
        updateDoc(doc(db, "rooms", roomId), { winner });
        setWinner(winner);
      }
    });

    return () => unsubscribe();
  }, [roomId, navigate, room]);

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
    const newNight = room.currentNight + 1;
    const newHistory = [
      ...(room.gameHistory || []),
      { night: newNight, deaths: [] },
    ];

    await updateDoc(roomRef, {
      currentNight: newNight,
      gameHistory: newHistory,
    });
  };

  const toggleAlive = async (player, diedBy = null) => {
    const playerRef = doc(db, "rooms", roomId, "players", player.id);
    const roomRef = doc(db, "rooms", roomId);

    let updatedHistory = [...(room?.gameHistory || [])];
    const currentNight = room.currentNight;

    if (player.alive) {
      // KILL
      if (updatedHistory.length < currentNight) {
        updatedHistory.push({ night: currentNight, deaths: [player.name] });
      } else {
        if (!updatedHistory[currentNight - 1].deaths) {
          updatedHistory[currentNight - 1].deaths = [];
        }
        updatedHistory[currentNight - 1].deaths.push(player.name);
      }

      await Promise.all([
        updateDoc(playerRef, {
          alive: false,
          diedBy: diedBy,
          deathTimestamp: Date.now(),
        }),
        updateDoc(roomRef, { gameHistory: updatedHistory }),
      ]);
    } else {
      // REVIVE
      await updateDoc(playerRef, {
        alive: true,
        diedBy: null,
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

    const roomSnap = await getDoc(roomRef);
    const roomData = roomSnap.data();

    const filteredRolePool = (roomData?.rolePool || []).filter(
      (role) => role.name !== "Villager"
    );

    batch.update(roomRef, {
      currentNight: 1,
      gameStarted: false,
      gameHistory: [],
      winner: null,
      rolePool: filteredRolePool,
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-4">{roomId}</h1>
      <div className="flex justify-center mb-4 flex-col w-full md:flex-row gap-2">
        <Button
          className="flex items-center gap-2 justify-center"
          onClick={nextNight}
          variant="outline"
          bgColor="accent-gold"
        >
          <SunMoon size={18} /> Next Night
        </Button>
        {winner && (
          <Button onClick={handleStartNewGame} variant="secondary">
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

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between"
                >
                  <PlayerCard
                    name={player.name}
                    emoji={player.emoji}
                    alive={player.alive}
                    toggleAlive={(diedBy) => toggleAlive(player, diedBy)}
                    roleName={player.role}
                    roleDescription={matchingRole?.description}
                    roleTeam={matchingRole?.team}
                  />
                </div>
              );
            })}
        </div>

        <div className="mt-6 border-t border-gray-600 pt-4">
          <h2 className="text-xl font-bold text-gray-100 mb-2">Game History</h2>
          {room?.gameHistory.length === 0 ? (
            <p className="text-gray-400 italic">No history yet.</p>
          ) : (
            <ul className="space-y-2">
              {room?.gameHistory.map((night, i) => (
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
