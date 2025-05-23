import { useState } from "react";
import Button from "./Button";

export default function CustomRoleForm({ onAddRole }) {
  const [customRoleName, setCustomRoleName] = useState("");
  const [customRoleDescription, setCustomRoleDescription] = useState("");
  const [team, setTeam] = useState("Neutral");
  const [isKiller, setIsKiller] = useState(false);

  const isFormValid = customRoleName.trim() && customRoleDescription.trim();

  const handleAddCustomRole = () => {
    if (!isFormValid) return;

    onAddRole(
      customRoleName.trim(),
      customRoleDescription.trim(),
      team,
      isKiller
    );

    setCustomRoleName("");
    setCustomRoleDescription("");
    setTeam("Neutral");
    setIsKiller(false);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl mb-1 text-white">Create a custom role</h3>
      <p className="text-sm text-gray-300 -mt-1 mb-2">
        Got another role in mind? Add the role name and description below!
      </p>

      <div className="flex flex-col gap-3">
        {/* Role Name */}
        <div>
          <label
            htmlFor="customRoleName"
            className="text-sm text-gray-200 block mb-1"
          >
            Role Name
          </label>
          <input
            type="text"
            id="customRoleName"
            value={customRoleName}
            onChange={(e) => setCustomRoleName(e.target.value)}
            placeholder="E.g., Jester"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="customRoleDescription"
            className="text-sm text-gray-200 block mb-1"
          >
            Description
          </label>
          <input
            type="text"
            id="customRoleDescription"
            value={customRoleDescription}
            onChange={(e) => setCustomRoleDescription(e.target.value)}
            placeholder="Briefly describe the role's ability"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          />
        </div>

        {/* Team Selector */}
        <div>
          <label htmlFor="team" className="text-sm text-gray-200 block mb-1">
            Team
          </label>
          <select
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          >
            <option value="Town">Town</option>
            <option value="Mafia">Mafia</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>

        {/* Killer Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isKiller"
            checked={isKiller}
            onChange={(e) => setIsKiller(e.target.checked)}
            className="form-checkbox h-4 w-4 text-red-500"
          />
          <label htmlFor="isKiller" className="text-sm text-gray-200">
            This role can kill
          </label>
        </div>

        {/* Button */}
        <Button
          onClick={handleAddCustomRole}
          bgColor="accent-gold"
          className="text-black disabled:opacity-40"
          disabled={!isFormValid}
        >
          Add Role
        </Button>
      </div>
    </div>
  );
}
