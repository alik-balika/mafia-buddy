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
  preAssignedRole,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [showDeathModal, setShowDeathModal] = useState(false);

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
          <form className="items-center w-full" onSubmit={handleNameSubmit}>
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
            <div className="flex items-center mt-1">
              <Button type="submit" className="w-full">
                Save
              </Button>
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
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between flex-1">
            <div>
              <div
                className={`flex items-center gap-2 text-lg font-semibold text-white wrap-anywhere ${
                  isNarrator ? "cursor-pointer hover:text-accent-gold-300" : ""
                }`}
                onClick={() => isNarrator && setIsEditing(true)}
                title={isNarrator ? "Click to edit name" : ""}
              >
                <span className="mafia-text">{name}</span>
                {isNarrator && <Pencil size={16} className="text-gray-300" />}
                {isCurrentUser && (
                  <span className="ml-2 text-sm text-accent-gold-500 font-normal">
                    (You)
                  </span>
                )}
              </div>
              {roleName && (
                <p className="text-gray-300 text-sm font-bold">{roleName}</p>
              )}
              {preAssignedRole && isNarrator && (
                <p className="text-gray-300 text-sm font-bold">
                  {preAssignedRole}
                </p>
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
            onClick={() => {
              if (alive) {
                setShowDeathModal(true);
              } else {
                toggleAlive();
              }
            }}
          >
            {alive ? <Skull size={16} /> : <Heart size={16} />}
            {alive ? "Kill" : "Revive"}
          </Button>
        )}
      </div>

      {roleDescription && (
        <div className="text-white text-sm">
          {roleDescription && (
            <div className="text-gray-300 text-xs mt-1">{roleDescription}</div>
          )}
          <div
            className={`w-fit px-2 py-0.5 mt-3 text-xs rounded-full text-white
            ${
              roleTeam === "mafia"
                ? "bg-red-600"
                : roleTeam === "neutral"
                ? "bg-blue-600"
                : "bg-green-600"
            }`}
          >
            {roleTeam}
          </div>
        </div>
      )}
      {showDeathModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowDeathModal(false)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg mb-4">How did {name} die?</h2>
            {[
              ["Voted Out", "vote"],
              ["Killed by Mafia", "mafia"],
            ].map(([label, value]) => (
              <button
                key={value}
                onClick={() => {
                  setShowDeathModal(false);
                  toggleAlive(value);
                }}
                className="w-full mb-2 p-2 bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                {label}
              </button>
            ))}
            <Button
              className="mt-2 text-sm w-full"
              onClick={() => setShowDeathModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
