import { useState } from "react";
import Button from "./Button";

// TODO: ADD OPTION TO SET TEAM TO MAFIA/TOWN/NEUTRAL
// ALSO KILLER FIELD??
export default function CustomRoleForm({ onAddRole }) {
  const [customRoleName, setCustomRoleName] = useState("");
  const [customRoleDescription, setCustomRoleDescription] = useState("");

  const handleAddCustomRole = () => {
    if (!customRoleName.trim() || !customRoleDescription.trim()) return;

    onAddRole(customRoleName.trim(), customRoleDescription.trim());
    setCustomRoleName("");
    setCustomRoleDescription("");
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl mb-1 text-white">Create a custom role</h3>
      <p className="text-sm text-gray-300 -mt-1 mb-2">
        Got another role in mind? Add the role name and description below!
      </p>
      <div className="flex flex-col gap-2">
        <div>
          <label
            htmlFor="customRoleName"
            className="text-sm text-gray-200 block mb-1"
          >
            Role Name
          </label>
          <input
            type="text"
            name="customRoleName"
            id="customRoleName"
            value={customRoleName}
            onChange={(e) => setCustomRoleName(e.target.value)}
            placeholder="E.g., Jester"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        <div>
          <label
            htmlFor="customRoleDescription"
            className="text-sm text-gray-200 block mb-1"
          >
            Description
          </label>
          <input
            type="text"
            name="customRoleDescription"
            id="customRoleDescription"
            value={customRoleDescription}
            onChange={(e) => setCustomRoleDescription(e.target.value)}
            placeholder="Briefly describe the role's ability"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        <Button
          onClick={handleAddCustomRole}
          bgColor="accent-gold"
          className="text-black"
        >
          Add Role
        </Button>
      </div>
    </div>
  );
}
