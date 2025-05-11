import { db } from "../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

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
