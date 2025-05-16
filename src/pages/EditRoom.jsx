import { useEffect, useState } from "react";
import { getRoom } from "../firebase/firestore/rooms";
import CreateRoom from "./CreateRoom";
import { useParams } from "react-router";

const EditRoom = () => {
  const { roomId } = useParams();
  const [roles, setRoles] = useState(null);

  useEffect(() => {
    async function fetchRoles() {
      const room = await getRoom(roomId);
      setRoles(room?.rolePool || []);
    }
    fetchRoles();
  }, [roomId]);

  if (!roles) return <p>Loading roles...</p>;

  return <CreateRoom initialRoles={roles} isEditing={true} roomId={roomId} />;
};

export default EditRoom;
