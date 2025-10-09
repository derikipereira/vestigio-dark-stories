import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './routes/components/ProtectedRoute';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';


const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/lobby"
                        element={
                            <ProtectedRoute>
                                <LobbyPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/game/:roomCode"
                        element={
                            <ProtectedRoute>
                                <GamePage />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route path="*" element={<Navigate to="/lobby" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;