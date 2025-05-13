import { db } from "../firebase";
import {
  doc,
  collection,
  getDocs,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const createRoom = async (roomId, narratorName, rolePool) => {
  const roomData = {
    narrator: narratorName,
    rolePool: rolePool,
    players: [],
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

  const nameTaken = playersSnap.docs.some(
    (doc) => doc.data().name.toLowerCase() === playerName.toLowerCase()
  );

  if (nameTaken) {
    throw new Error("Name is already taken in this room.");
  }

  const playerId = uuidv4();
  await setDoc(doc(playersRef, playerId), {
    name: playerName,
    role: null,
    isNarrator: false,
    joinedAt: Date.now(),
  });

  return playerId;
};
