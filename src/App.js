import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ObjectifList from './components/ObjectifList';
import ObjectifForm from './components/ObjectifForm';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Loi d'Attraction
          </Typography>
          {isAuthenticated && (
            <Button color="inherit" onClick={handleLogout}>
              Déconnexion
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <>
                  <ObjectifForm />
                  <ObjectifList />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App; 