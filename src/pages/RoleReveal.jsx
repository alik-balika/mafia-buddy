import { useParams } from "react-router";
import { useEffect, useState } from "react";

const dummyAssignedRoles = {
  Bob: { name: "Mafia", description: "You are a member of the mafia." },
  Jane: { name: "Villager", description: "You're just a normal villager." },
  Tom: { name: "Detective", description: "You can investigate each night." },
};

// TODO MAKE THIS MORE OF AN ACTUAL LOOKING CARD THAT WHEN TAPPED CAN BE FLIPPED TO HIDE/REVEAL
// ALSO, ON DEATH SHOULD BE ABLE TO SEE WHAT EVERYONE ELSE IS
// ALSO, SHOULD SUPPORT PERSISTENT CONNECTION. IF THE PAGE GETS REFRESHED OR THE PHONE TURNS OFF
// THEY SHOULD BE ABLE TO RECONNECT AND SEE EVERYTHING EASILY
const RoleReveal = () => {
  const { roomId, playerName } = useParams();
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Simulate getting assigned role
    console.log(playerName);
    setRole(dummyAssignedRoles[playerName]);
  }, [playerName]);

  if (!role) return <p>Loading role...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Your Role</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
        <p className="text-xl font-bold mb-2">{role.name}</p>
        <p className="text-gray-300 text-sm">{role.description}</p>
      </div>
    </div>
  );
};

export default RoleReveal;
