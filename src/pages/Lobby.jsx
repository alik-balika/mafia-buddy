import React from "react";
import { useParams } from "react-router";
import Button from "../components/Button";

import { Copy } from "lucide-react";

const Lobby = () => {
  const { roomId } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-2">{roomId}</h1>
      <div className="flex justify-center gap-4">
        <Button
          bgColor="accent-gold"
          className="text-black font-semibold flex gap-2"
        >
          <Copy /> Copy Invite Link
        </Button>
        <Button>Leave Room</Button>
      </div>
    </div>
  );
};

export default Lobby;
