import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

const SelectedGameRole = ({
  roleName,
  roleDescription,
  count,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <div className="bg-gray-700 p-3 rounded flex justify-between items-center mb-2">
      <div className="flex flex-col mr-1">
        <p className="font-semibold">
          {roleName} (x{count})
        </p>
        <p className="text-xs text-gray-300">{roleDescription}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="p-1 rounded bg-gray-600 hover:bg-gray-500 cursor-pointer"
          onClick={onDecrement}
        >
          <Minus size={32} />
        </button>
        <button
          className="p-1 rounded bg-gray-600 hover:bg-gray-500 cursor-pointer"
          onClick={onIncrement}
        >
          <Plus size={32} />
        </button>
        <button
          className="p-1 rounded bg-red-600 hover:bg-red-500 cursor-pointer"
          onClick={onRemove}
        >
          <Trash2 size={32} />
        </button>
      </div>
    </div>
  );
};

export default SelectedGameRole;
