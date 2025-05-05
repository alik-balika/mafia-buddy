import React, { useState } from "react";
import Button from "../components/Button";
import CommonRoleOption from "../components/CommonRoleOption";

const CreateRoom = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold">Create Your Mafia Game</h1>
        <p className="text-gray-400">Choose the roles for your game.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-3">Select Roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <CommonRoleOption
            roleName={"Mafia"}
            roleDescription={
              "Works with other Mafia members to eliminate all non-mafia players"
            }
          />
          <CommonRoleOption
            roleName={"Angel"}
            roleDescription={
              "Can protect one person from being killed each night"
            }
          />
          <CommonRoleOption
            roleName={"Cop"}
            roleDescription={
              "Can investigate one person each night to detmine if they are a Mafia"
            }
          />
          <CommonRoleOption
            roleName={"Doctor"}
            roleDescription={
              "Can save one person from being killed each night (even themselves)"
            }
          />
          <CommonRoleOption
            roleName={"Suicide Bomber"}
            roleDescription={
              "Can choose to take someone down with them at any point during a town meeting"
            }
          />
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
    </div>
  );
};

export default CreateRoom;
