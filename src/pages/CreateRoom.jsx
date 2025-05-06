import React, { useState } from "react";
import Button from "../components/Button";
import CommonRoleOption from "../components/CommonRoleOption";
import SelectedGameRole from "../components/SelectedGameRole";

const CreateRoom = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedGameRoles, setSelectedGameRoles] = useState([]);

  const commonRoles = [
    {
      name: "Mafia",
      description:
        "Works with other Mafia members to eliminate all non-mafia players",
      count: 1,
    },
    {
      name: "Angel",
      description: "Can protect one person from being killed each night",
      count: 1,
    },
    {
      name: "Cop",
      description:
        "Can investigate one person each night to detmine if they are a Mafia",
      count: 1,
    },
    {
      name: "Doctor",
      description:
        "Can save one person from being killed each night (even themselves)",
      count: 1,
    },
    {
      name: "Suicide Bomber",
      description:
        "Can choose to take someone down with them at any point during a town meeting",
      count: 1,
    },
  ];

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

  return (
    <div className="flex flex-col">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">Create Your Mafia Game</h1>
        <p className="text-gray-400">Choose the roles for your game.</p>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-3">Select Roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {commonRoles.map((role) => (
            <CommonRoleOption
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
                Select a less common role from the dropdown below
              </p>
              <select
                name="other-roles"
                id="other-roles"
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 cursor-pointer"
              >
                <option value="">Select a role</option>
                <option value="">Option 1</option>
                <option value="">Option 2</option>
              </select>
            </div>
            <div>
              <h3 className="text-xl mb-1">Create a custom role</h3>
              <p className="text-sm text-gray-300 -mt-1 mb-2">
                Got another role in mind? Add the role name and description
                below!
              </p>
              <div className="flex flex-col">
                <label htmlFor="customRoleName">Role Name</label>
                <input
                  type="text"
                  name="customRoleName"
                  id="customRoleName"
                  placeholder="E.g., Jester"
                  className="p-2 rounded bg-gray-800 border border-gray-600 mb-2"
                />
                <label htmlFor="customRoleDescription">Description</label>
                <input
                  type="text"
                  name="customRoleDescription"
                  id="customRoleDescription"
                  placeholder="Briefly describe the role's ability"
                  className="p-2 rounded bg-gray-800 border border-gray-600 mb-2"
                />
              </div>
            </div>
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
      <Button onClick={() => console.log("Create Room")}>Create room</Button>
    </div>
  );
};

export default CreateRoom;
