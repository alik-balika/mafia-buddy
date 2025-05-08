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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="create-room" element={<CreateRoom />} />
          <Route path="join-room" element={<JoinRoom />} />
          <Route path="lobby/:roomId" element={<Lobby />} />
          <Route path="role-reveal" element={<RoleReveal />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
