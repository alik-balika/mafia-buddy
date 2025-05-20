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
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { getRandomEmoji } from "../../utils";

export const createRoom = async (roomId, rolePool) => {
  if (!roomId) {
    throw new Error("roomId is invalid!");
  }

  const roomData = {
    rolePool: rolePool,
    gameStarted: false,
    gameHistory: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "rooms", roomId.toUpperCase()), roomData);
};

export const getRoom = async (roomId) => {
  const docSnap = await getDoc(doc(db, "rooms", roomId));

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data();
};

export const joinRoom = async (roomId, playerName) => {
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
    isNarrator: false,
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

// TODO: RANDOMIZE ROLES
export const startGame = async (roomId) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      gameStarted: true,
    });
  } catch (error) {
    console.error("Failed to start the game:", error);
    throw error;
  }
};
