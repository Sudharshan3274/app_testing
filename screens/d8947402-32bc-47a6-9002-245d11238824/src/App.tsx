import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Splash } from './pages/Splash';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { LiveInterview } from './pages/LiveInterview';
import { ScreensIndex } from './pages/ScreensIndex';
import { NotFound } from './pages/NotFound';
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/live" element={<LiveInterview />} />
        <Route path="/screens" element={<ScreensIndex />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>);

}