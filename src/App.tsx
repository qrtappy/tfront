import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import AdminLogin from "./pages/admin/index";
import AdminQR from "./pages/admin/QR";
import AdminStickers from "./pages/admin/Stickers";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/qr" element={<AdminQR />} />
        <Route path="/admin/stickers" element={<AdminStickers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
