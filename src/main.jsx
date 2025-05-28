import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import {
  CreateRoom,
  Home,
  JoinRoom,
  Lobby,
  NotFound,
  RoleReveal,
} from "./pages";
import Layout from "./components/Layout";
import GameRoom from "./pages/GameRoom";
import EditRoom from "./pages/EditRoom";

// Define the app tree
const App = (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="create-room" element={<CreateRoom />} />
        <Route path="join-room" element={<JoinRoom />} />
        <Route path="lobby/:roomId" element={<Lobby />} />
        <Route path="role-reveal/:roomId" element={<RoleReveal />} />
        <Route path="game-room/:roomId" element={<GameRoom />} />
        <Route path="edit-room/:roomId" element={<EditRoom />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const Root =
  import.meta.env.VITE_NODE_ENV === "DEV" ? (
    <StrictMode>{App}</StrictMode>
  ) : (
    App
  );

createRoot(document.getElementById("root")).render(Root);
