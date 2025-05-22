import React, { useState } from "react";
import { useNavigate } from "react-router";

import Button from "../components/Button";
import RoleOption from "../components/RoleOption";
import SelectedGameRole from "../components/SelectedGameRole";
import CustomRoleForm from "../components/CustomRoleForm";
import roles from "../assets/roles.json";
import { createRoom, updateRoomRoles } from "../firebase/firestore/rooms";

const CreateRoom = ({ initialRoles = [], isEditing = false, roomId }) => {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedGameRoles, setSelectedGameRoles] = useState(initialRoles);
  const [errors, setErrors] = useState([]);
  const [narratorName, setNarratorName] = useState("");

  const handleAddRole = (roleName, roleDescription, roleTeam, isKiller) => {
    setSelectedGameRoles((prev) =>
      prev.some((role) => role.name === roleName)
        ? prev
        : [
            ...prev,
            {
              name: roleName,
              description: roleDescription,
              count: 1,
              team: roleTeam,
              killer: isKiller,
            },
          ]
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

  const handleCreateOrUpdateRoom = async () => {
    const validationErrors = [];

    if (selectedGameRoles.length === 0) {
      validationErrors.push("Please select at least one role for the game.");
    }

    const hasMafia = selectedGameRoles.some(
      (role) => role.killer == true && role.count > 0
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

    if (!narratorName.trim()) {
      validationErrors.push("Please enter a narrator name.");
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isEditing) {
      await updateRoomRoles(roomId, selectedGameRoles);
    } else {
      roomId = Math.random().toString(36).substring(7).toUpperCase();
      await createRoom(roomId, selectedGameRoles, narratorName);
    }

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
              onClick={() =>
                handleAddRole(
                  role.name,
                  role.description,
                  role.team,
                  role.killer
                )
              }
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
                    onClick={() =>
                      handleAddRole(
                        role.name,
                        role.description,
                        role.team,
                        role.killer
                      )
                    }
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
      {!isEditing && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">
            Narrator Name
          </label>
          <input
            type="text"
            value={narratorName}
            onChange={(e) => setNarratorName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>
      )}
      {errors &&
        errors.map((error) => <p className="text-red-500 text-sm">{error}</p>)}
      <Button className="mt-2" onClick={handleCreateOrUpdateRoom}>
        {isEditing ? "Update" : "Create"} room
      </Button>
      {isEditing && (
        <Button
          onClick={() => navigate(`/lobby/${roomId}`)}
          className="mt-2"
          variant="outline"
        >
          Back to Lobby
        </Button>
      )}
    </div>
  );
};

export default CreateRoom;
