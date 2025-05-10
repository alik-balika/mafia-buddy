import React from "react";

const PlayerCard = ({ name, emoji, onEmojiClick }) => {
  return (
    <div className="flex items-center gap-4 bg-gray-600 p-3 rounded-xl shadow-md w-full max-w-md mx-auto">
      <div
        className="flex items-center justify-center min-w-12 min-h-12 bg-gray-800 rounded-full text-2xl select-none cursor-pointer inset-shadow-black inset-shadow-sm"
        onClick={onEmojiClick}
      >
        {emoji}
      </div>
      <p className="text-lg font-semibold text-white wrap-anywhere">{name}</p>
    </div>
  );
};

export default PlayerCard;
