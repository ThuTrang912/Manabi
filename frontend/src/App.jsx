
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import FolderPage from "./pages/FolderPage.jsx";
import FoldersPage from "./pages/FoldersPage.jsx";
import AddCardSetPage from "./pages/AddCardSetPage.jsx";
import LibraryPage from "./pages/LibraryPage";
import CardStudyPage from "./pages/CardStudyPage.jsx";
import CardSetPage from "./pages/CardSetPage.jsx";
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
        <Route path="/sets" element={
          <PrivateRoute>
            <LibraryPage />
          </PrivateRoute>
        } />
        <Route path="/library" element={
          <PrivateRoute>
            <LibraryPage />
          </PrivateRoute>
        } />
        <Route path="/library/folders" element={
          <PrivateRoute>
            <FoldersPage />
          </PrivateRoute>
        } />
        <Route path="/add-cardset" element={
          <PrivateRoute>
            <AddCardSetPage />
          </PrivateRoute>
        } />
        <Route path="/edit-cardset/:cardSetId" element={
          <PrivateRoute>
            <AddCardSetPage />
          </PrivateRoute>
        } />
        <Route path="/cardset/:cardSetId" element={
          <PrivateRoute>
            <CardSetPage />
          </PrivateRoute>
        } />
        <Route path="/cardset/:cardsetId/study" element={
          <PrivateRoute>
            <CardStudyPage />
          </PrivateRoute>
        } />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;