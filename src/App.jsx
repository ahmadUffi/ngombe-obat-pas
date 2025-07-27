import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Jadwal from "./Page/Jadwal";
import Control from "./Page/Control";
import Note from "./Page/Note";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Jadwal />} />
        <Route path="/jadwal" element={<Jadwal />} />
        <Route path="/control" element={<Control />} />
        <Route path="/note" element={<Note />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
