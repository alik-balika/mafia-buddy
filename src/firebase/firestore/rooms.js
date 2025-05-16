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
  const roomData = {
    rolePool: rolePool,
    assignedRoles: {},
    gameStarted: false,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "rooms", roomId), roomData);
};

export const getRoom = async (roomId) => {
  const docSnap = await getDoc(doc(db, "rooms", roomId));

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data();
};

export const joinRoom = async (roomId, playerName) => {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    throw new Error("Room does not exist");
  }

  const playersRef = collection(db, `rooms/${roomId}/players`);
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
    joinedAt: serverTimestamp(),
  });

  return playerId;
};

export const changePlayerEmoji = async (roomId, playerId) => {
  const newEmoji = getRandomEmoji();

  const playerRef = doc(db, `rooms/${roomId}/players`, playerId);
  await updateDoc(playerRef, {
    emoji: newEmoji,
  });

  return newEmoji;
};

export const removePlayerFromRoom = async (roomId, playerId) => {
  const playerRef = doc(db, `rooms/${roomId}/players`, playerId);
  await deleteDoc(playerRef);
};

export const getPlayerRole = async (roomId, playerId) => {
  try {
    if (!playerId) {
      throw new Error("Player ID not found.");
    }

    const roleRef = doc(db, `rooms/${roomId}/players`, playerId);
    const roleSnapshot = await getDoc(roleRef);

    if (roleSnapshot.exists()) {
      return roleSnapshot.data().role;
    } else {
      throw new Error("Role not found for this player.");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updatePlayerName = async (roomId, playerId, newName) => {
  const playerRef = doc(db, "rooms", roomId, "players", playerId);
  await updateDoc(playerRef, {
    name: newName,
  });
};
