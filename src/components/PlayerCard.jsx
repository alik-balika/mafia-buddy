import { Pencil, X, Trash2, Skull, Heart } from "lucide-react";
import React, { useState } from "react";
import Button from "./Button";

const PlayerCard = ({
  name,
  emoji,
  alive = true,
  onEmojiClick,
  isCurrentUser,
  isNarrator,
  onNameChange,
  onKick,
  toggleAlive,
  roleName,
  roleDescription,
  roleTeam,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    if (tempName.trim() && tempName !== name) {
      onNameChange?.(tempName.trim());
    } else {
      setTempName(name);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-xl shadow-md w-full max-w-md mx-auto transition-all duration-300
    ${
      isCurrentUser
        ? "bg-accent-gold-900 border-2 border-accent-gold-500"
        : "bg-gray-600"
    }
    ${
      roleName
        ? `border-2 ${
            roleTeam === "mafia"
              ? "border-red-500"
              : roleTeam === "neutral"
              ? "border-blue-500"
              : "border-green-500"
          }`
        : ""
    }
  `}
    >
      <div
        className={`flex items-center justify-between gap-4 ${
          !alive ? "opacity-50 grayscale" : ""
        }`}
      >
        <div
          className={`flex items-center justify-center min-w-12 min-h-12 bg-gray-800 rounded-full text-2xl select-none inset-shadow-black inset-shadow-sm ${
            isCurrentUser ? "cursor-pointer" : ""
          }`}
          onClick={onEmojiClick}
          title={isCurrentUser ? "This is you!" : name}
        >
          {emoji}
        </div>

        {isNarrator && isEditing ? (
          <form
            className="flex gap-3 items-center w-full"
            onSubmit={handleNameSubmit}
          >
            <input
              value={tempName}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
              onChange={(e) => setTempName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setTempName(name);
                }
              }}
            />
            <Button type="submit">Save</Button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setTempName(name);
              }}
              className="p-1"
              title="Cancel"
            >
              <X size={24} className="text-gray-400 hover:text-red-400" />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between flex-1">
            <div
              className={`flex items-center gap-2 text-lg font-semibold text-white wrap-anywhere ${
                isNarrator ? "cursor-pointer hover:text-accent-gold-300" : ""
              }`}
              onClick={() => isNarrator && setIsEditing(true)}
              title={isNarrator ? "Click to edit name" : ""}
            >
              <span>{name}</span>
              {isNarrator && <Pencil size={16} className="text-gray-300" />}
              {isCurrentUser && (
                <span className="ml-2 text-sm text-accent-gold-500 font-normal">
                  (You)
                </span>
              )}
            </div>
            {isNarrator && !isCurrentUser && (
              <Trash2
                size={18}
                className="ml-2 cursor-pointer text-red-400 hover:text-red-600"
                title="Kick this player"
                onClick={onKick}
              />
            )}
          </div>
        )}

        {toggleAlive && (
          <Button
            bgColor={alive ? "primary" : "gray"}
            className="ml-4 flex items-center gap-1 text-sm whitespace-nowrap"
            onClick={toggleAlive}
          >
            {alive ? <Skull size={16} /> : <Heart size={16} />}
            {alive ? "Kill" : "Revive"}
          </Button>
        )}
      </div>

      {(roleName || roleDescription) && (
        <div>
          {roleName && (
            <div className="text-sm font-semibold text-white">
              {roleName}:
              {roleDescription && (
                <span className="text-xs text-gray-300">
                  {" "}
                  {roleDescription}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
