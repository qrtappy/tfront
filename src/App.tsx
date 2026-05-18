import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
