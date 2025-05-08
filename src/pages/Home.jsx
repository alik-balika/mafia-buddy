import React from "react";

import Button from "../components/Button";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <header className="text-center">
        <h1 className="text-3xl">Mafia Buddy</h1>
        <hr className="h-1 mx-auto my-4 border-0 dark:bg-gray-700"></hr>
      </header>
      <Button onClick={() => navigate("/create-room")}>Create a room</Button>
      <Button onClick={() => navigate("/join-room")}>Join a room</Button>
    </div>
  );
};

export default Home;
