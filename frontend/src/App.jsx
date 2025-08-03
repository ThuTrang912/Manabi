
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import FolderPage from "./pages/FolderPage.jsx";
import AddCardSetPage from "./pages/AddCardSetPage.jsx";
import LibraryPage from "./pages/LibraryPage";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  // Cho phép truy cập nếu đã có token trong localStorage hoặc token trên URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const isLoggedIn = !!localStorage.getItem("auth_token") || !!token;
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/homepage" element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } />
        <Route path="/folder/:folderId" element={
          <PrivateRoute>
            <FolderPage />
          </PrivateRoute>
        } />
        <Route path="/user/:userName/folder/:folderId" element={
          <PrivateRoute>
            <FolderPage />
          </PrivateRoute>
        } />
        <Route path="/user/:userName/sets" element={
          <PrivateRoute>
            <LibraryPage />
          </PrivateRoute>
        } />
        <Route path="/add-cardset" element={
          <PrivateRoute>
            <AddCardSetPage />
          </PrivateRoute>
        } />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;