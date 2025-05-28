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

      {/* Ugh. For some reason, I need to actively display these for the buttons to work. I suspect it's because I'm
      dynamically assigning background colors to the buttons and so they are not cached and it doesn't work. Keeping this here
      for easy uncommenting to make the colors work */}
      {/* <p className="bg-primary-100">a</p>
      <p className="bg-primary-200">a</p>
      <p className="bg-primary-300">a</p>
      <p className="bg-primary-400">a</p>
      <p className="bg-primary-500">a</p>
      <p className="bg-primary-600">a</p>
      <p className="bg-primary-700">a</p>
      <p className="bg-primary-800">a</p>
      <p className="bg-primary-900">a</p>
      <p className="bg-accent-gold-100">a</p>
      <p className="bg-accent-gold-200">a</p>
      <p className="bg-accent-gold-300">a</p>
      <p className="bg-accent-gold-400">a</p>
      <p className="bg-accent-gold-500">a</p>
      <p className="bg-accent-gold-600">a</p>
      <p className="bg-accent-gold-700">a</p>
      <p className="bg-accent-gold-800">a</p>
      <p className="bg-accent-gold-900">a</p> */}
    </div>
  );
};

export default Home;
