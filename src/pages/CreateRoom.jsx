import React, { useState } from "react";
import { useNavigate } from "react-router";

import Button from "../components/Button";
import RoleOption from "../components/RoleOption";
import SelectedGameRole from "../components/SelectedGameRole";
import CustomRoleForm from "../components/CustomRoleForm";
import roles from "../assets/roles.json";
import { createRoom } from "../firebase/firestore/rooms";

const CreateRoom = () => {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedGameRoles, setSelectedGameRoles] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleAddRole = (roleName, roleDescription) => {
    setSelectedGameRoles((prev) =>
      prev.some((role) => role.name === roleName)
        ? prev
        : [...prev, { name: roleName, description: roleDescription, count: 1 }]
    );
  };

  const incrementCount = (name) => {
    setSelectedGameRoles((prev) =>
      prev.map((role) =>
        role.name === name ? { ...role, count: role.count + 1 } : role
      )
    );
  };

  const decrementCount = (name) => {
    setSelectedGameRoles((prev) =>
      prev.map((role) =>
        role.name === name && role.count > 1
          ? { ...role, count: role.count - 1 }
          : role
      )
    );
  };

  const removeRole = (name) => {
    setSelectedGameRoles((prev) => prev.filter((role) => role.name !== name));
  };

  const handleCreateRoom = () => {
    // In a real application, you would likely:
    // 1. Send the selectedGameRoles to your server to create a new room.
    // 2. Receive the unique room ID from the server.

    const validationErrors = [];

    if (selectedGameRoles.length === 0) {
      validationErrors.push("Please select at least one role for the game.");
    }

    const mafiaLikeRoles = ["Mafia", "Mafia Godfather", "Arsonist"];
    const hasMafia = selectedGameRoles.some(
      (role) => mafiaLikeRoles.includes(role.name) && role.count > 0
    );

    if (!hasMafia) {
      validationErrors.push(
        "Please select at least one mafia-like role for the game."
      );
    }

    const totalRoles = selectedGameRoles.reduce(
      (sum, role) => sum + role.count,
      0
    );

    if (totalRoles < 3) {
      validationErrors.push("The game needs at least 3 roles.");
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const roomId = Math.random().toString(36).substring(7).toUpperCase();
    createRoom(roomId, "Alik", selectedGameRoles);
    navigate(`/lobby/${roomId}`);
  };

  return (
    <div className="flex flex-col">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">Create Your Mafia Game</h1>
        <p className="text-gray-400">Choose the roles for your game.</p>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-3">Select Roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {roles.common.map((role) => (
            <RoleOption
              key={role.name}
              roleName={role.name}
              roleDescription={role.description}
              onClick={() => handleAddRole(role.name, role.description)}
            />
          ))}
        </div>
        <div className="mb-2">
          <button
            className="text-left w-full text-white font-medium bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
            <span className="float-right">{showAdvanced ? "▲" : "▼"}</span>
          </button>
        </div>
        {showAdvanced && (
          <div className="mt-2 space-y-4 transition-all duration-300">
            <div>
              <h3 className="text-xl">Other Roles</h3>
              <p className="text-sm text-gray-300 -mt-1 mb-2">
                Select a less common role
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {roles.uncommon.map((role) => (
                  <RoleOption
                    key={role.name}
                    roleName={role.name}
                    roleDescription={role.description}
                    onClick={() => handleAddRole(role.name, role.description)}
                  />
                ))}
              </div>
            </div>
            <CustomRoleForm onAddRole={handleAddRole} />
          </div>
        )}
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-3">Game Roles</h2>
        <div className="flex flex-col gap-2">
          {selectedGameRoles.length === 0 ? (
            <div className="text-gray-300">
              No roles added yet. Select predefined roles or create custom ones.
            </div>
          ) : (
            selectedGameRoles.map((role, index) => (
              <SelectedGameRole
                key={`${role.name}-${index}`}
                roleName={role.name}
                roleDescription={role.description}
                count={role.count}
                onIncrement={() => incrementCount(role.name)}
                onDecrement={() => decrementCount(role.name)}
                onRemove={() => removeRole(role.name)}
              />
            ))
          )}
        </div>
      </div>
      {errors &&
        errors.map((error) => <p className="text-red-500 text-sm">{error}</p>)}
      <Button className="mt-2" onClick={handleCreateRoom}>
        Create room
      </Button>
    </div>
  );
};

export default CreateRoom;
