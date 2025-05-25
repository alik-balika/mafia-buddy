import { db } from "../firebase";
import {
  doc,
  collection,
  getDocs,
  serverTimestamp,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getRandomEmoji } from "../../utils";
import roles from "../../assets/roles.json";

export const createRoom = async (roomId, rolePool, narratorName) => {
  if (!roomId) {
    throw new Error("roomId is invalid!");
  }

  const roomData = {
    rolePool: rolePool,
    gameStarted: false,
    gameHistory: [],
    winner: null,
    currentNight: 1,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "rooms", roomId.toUpperCase()), roomData);
  const playerId = await joinRoom(roomId, narratorName, true);
  localStorage.setItem("playerId", playerId);
  localStorage.setItem("roomId", roomId);
};

export const getRoom = async (roomId) => {
  const docSnap = await getDoc(doc(db, "rooms", roomId));

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data();
};

export const joinRoom = async (roomId, playerName, isNarrator = false) => {
  if (!roomId) {
    throw new Error("Please enter a valid roomId");
  }

  roomId = roomId.toUpperCase();

  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Room does not exist");
  }

  const roomData = roomSnap.data();

  if (roomData.gameStarted) {
    throw new Error("Cannot join, the game has already started.");
  }

  const playersRef = collection(db, "rooms", roomId, "players");
  const playersSnap = await getDocs(playersRef);

  playerName = playerName.trim();
  const nameTaken = playersSnap.docs.some(
    (doc) => doc.data().name.toLowerCase() === playerName.toLowerCase()
  );

  if (nameTaken) {
    throw new Error("Name is already taken in this room.");
  }

  const playerId = uuidv4();
  await setDoc(doc(playersRef, playerId), {
    name: playerName,
    emoji: getRandomEmoji(),
    role: null,
    isNarrator: isNarrator,
    alive: true,
    joinedAt: serverTimestamp(),
  });

  return playerId;
};

export const changePlayerEmoji = async (roomId, playerId) => {
  const newEmoji = getRandomEmoji();

  const playerRef = doc(db, "rooms", roomId, "players", playerId);
  await updateDoc(playerRef, {
    emoji: newEmoji,
  });

  return newEmoji;
};

export const removePlayerFromRoom = async (roomId, playerId) => {
  const playerRef = doc(db, "rooms", roomId, "players", playerId);
  await deleteDoc(playerRef);
};

export const getPlayerRole = async (roomId, playerId) => {
  if (!playerId) {
    throw new Error("Player ID not found.");
  }

  const roleRef = doc(db, "rooms", roomId, "players", playerId);
  const roleSnapshot = await getDoc(roleRef);

  if (roleSnapshot.exists()) {
    return roleSnapshot.data().role;
  } else {
    throw new Error("Role not found for this player.");
  }
};

export const updatePlayerName = async (roomId, playerId, newName) => {
  const playerRef = doc(db, "rooms", roomId, "players", playerId);
  await updateDoc(playerRef, {
    name: newName,
  });
};

export const updateRoomRoles = async (roomId, newRolePool) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      rolePool: newRolePool,
    });
  } catch (error) {
    console.error("Failed to update room roles:", error);
    throw error;
  }
};

// yes I know this function is large and could be refactored but I can't be bothered
export const startGame = async (roomId) => {
  const roomRef = doc(db, "rooms", roomId);

  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error("Room does not exist");
  }

  const roomData = roomSnap.data();

  const playerSnap = await getDocs(collection(db, "rooms", roomId, "players"));
  const players = playerSnap.docs;

  const activePlayers = players.filter((doc) => !doc.data().isNarrator);
  const assignedCount = roomData.rolePool.reduce(
    (sum, role) => sum + role.count,
    0
  );
  const numVillagersNeeded = activePlayers.length - assignedCount;

  if (numVillagersNeeded < 0) {
    throw new Error("More roles than players — reduce role counts");
  }

  const finalRolePool = [...roomData.rolePool];
  if (numVillagersNeeded > 0) {
    finalRolePool.push({
      name: "Villager",
      description: roles.villager.description,
      count: numVillagersNeeded,
      team: "town",
    });
  }

  const allRoles = finalRolePool.flatMap((role) =>
    Array(role.count).fill(role.name)
  );

  // shuffle the roles
  for (let i = allRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allRoles[i], allRoles[j]] = [allRoles[j], allRoles[i]];
  }

  const batch = writeBatch(db);
  activePlayers.forEach((docSnap, index) => {
    const playerRef = doc(db, "rooms", roomId, "players", docSnap.id);
    batch.update(playerRef, {
      role: allRoles[index],
    });
  });

  batch.update(roomRef, {
    rolePool: finalRolePool,
    gameStarted: true,
  });

  await batch.commit();
};
