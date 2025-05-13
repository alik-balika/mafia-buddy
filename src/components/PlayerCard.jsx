import React from "react";

const PlayerCard = ({ name, emoji, onEmojiClick, isCurrentUser }) => {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl shadow-md w-full max-w-md mx-auto ${
        isCurrentUser
          ? "bg-accent-gold-900 border-2 border-accent-gold-500"
          : "bg-gray-600"
      }`}
    >
      <div
        className="flex items-center justify-center min-w-12 min-h-12 bg-gray-800 rounded-full text-2xl select-none cursor-pointer inset-shadow-black inset-shadow-sm"
        onClick={onEmojiClick}
        title={isCurrentUser ? "This is you!" : name}
      >
        {emoji}
      </div>
      <p className="text-lg font-semibold text-white wrap-anywhere">
        {name}
        {isCurrentUser && (
          <span className="ml-2 text-sm text-accent-gold-500 font-normal">
            (You)
          </span>
        )}
      </p>
    </div>
  );
};

export default PlayerCard;
