import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper,
  ThemeProvider,
  createTheme,
  Fade,
  LinearProgress,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  alpha
} from '@mui/material';
import { purple, amber, green, pink } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: purple[700],
      light: purple[400],
      dark: purple[900],
    },
    secondary: {
      main: pink[400],
      light: pink[200],
      dark: pink[600],
    },
    success: {
      main: green[500],
      light: green[300],
      dark: green[700],
    }
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
      background: `linear-gradient(45deg, ${purple[700]} 30%, ${pink[400]} 90%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textAlign: 'center',
      marginBottom: '1rem'
    },
    h6: {
      fontWeight: 500,
      color: purple[500],
      textAlign: 'center',
      marginBottom: '2rem'
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: 'none',
          fontSize: '1.1rem',
          padding: '12px 24px',
          background: `linear-gradient(45deg, ${purple[700]} 30%, ${pink[400]} 90%)`,
          color: 'white',
          boxShadow: '0 4px 20px 0 rgba(156, 39, 176, 0.25)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px 0 rgba(156, 39, 176, 0.35)',
          },
          '&:disabled': {
            background: '#e0e0e0',
            color: '#9e9e9e'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 15,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px 0 rgba(156, 39, 176, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 20px 0 rgba(156, 39, 176, 0.25)',
            }
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 15,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px 0 rgba(156, 39, 176, 0.15)',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 15,
          padding: '8px 4px',
          height: 'auto',
          '& .MuiChip-label': {
            padding: '0 12px',
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: '16px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
        }
      }
    }
  }
});

function App() {
  const [objectif, setObjectif] = useState('');
  const [objectifs, setObjectifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('9');
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const manifestationsCount = objectifs.filter(obj => {
    const objDate = new Date(obj.date);
    return objDate.toDateString() === selectedDate.toDateString();
  }).length;

  const getManifestationTarget = (time) => {
    switch(time) {
      case '9': return 3;
      case '12': return 6;
      case '15': return 9;
      default: return 0;
    }
  };

  // Fonction pour gérer l'authentification
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setOpenAuthDialog(false);
      setSnackbar({
        open: true,
        message: isLogin ? 'Connexion réussie' : 'Compte créé avec succès',
        severity: 'success'
      });
      fetchObjectifs();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // Fonction pour charger les objectifs
  const fetchObjectifs = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/objectifs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors du chargement des objectifs');
      const data = await response.json();
      setObjectifs(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger vos objectifs');
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      fetchObjectifs();
    }
  }, []);

  // Fonction pour compter les vœux par créneau horaire pour la date sélectionnée
  const getVoeuxCount = (heure) => {
    return objectifs.filter(obj => {
      const objDate = new Date(obj.date);
      return objDate.toDateString() === selectedDate.toDateString() && obj.time === heure;
    }).length;
  };

  // Fonction pour vérifier si on peut ajouter un vœu pour le créneau horaire
  const canAddVoeu = (heure) => {
    const count = getVoeuxCount(heure);
    switch(heure) {
      case '9': return count < 3;
      case '12': return count < 6;
      case '15': return count < 9;
      default: return false;
    }
  };

  // Fonction pour vérifier si la limite quotidienne est atteinte
  const isQuotaReached = () => {
    const today = new Date().toDateString();
    const todayWishes = objectifs.filter(obj => 
      new Date(obj.date).toDateString() === today
    ).length;
    return todayWishes >= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setOpenAuthDialog(true);
      return;
    }

    if (isQuotaReached()) {
      setError("Vous avez atteint votre limite de 18 vœux pour aujourd'hui. Revenez demain !");
      return;
    }

    if (objectif.trim()) {
      if (!canAddVoeu(selectedTime)) {
        setError(`Vous avez déjà atteint le nombre maximum de vœux pour ${selectedTime}h`);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/objectifs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            text: objectif,
            date: selectedDate.toISOString(),
            time: selectedTime,
            repetitions: getManifestationTarget(selectedTime)
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
        
        const savedObjectif = await response.json();
        setObjectifs([...objectifs, savedObjectif]);
        setObjectif('');
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de sauvegarder votre intention');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setObjectifs([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%239C27B0" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
            opacity: 0.5,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {error && (
            <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#ffebee', color: '#c62828' }}>
              <Typography>{error}</Typography>
            </Paper>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            {user && (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleLogout}
              >
                Déconnexion ({user.name})
              </Button>
            )}
          </Box>

          <Grid container spacing={4}>
            {/* Colonne de gauche : Formulaire */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 4 }}>
                <Fade in timeout={1000}>
                  <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
                    Loi d'Attraction
                  </Typography>
                </Fade>
                
                <Fade in timeout={1500}>
                  <Typography variant="h6" component="h2" gutterBottom align="center" sx={{ mb: 5 }}>
                    Visualisez vos rêves, manifestez votre réalité
                  </Typography>
                </Fade>
                
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                  {!user ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Connectez-vous pour commencer à manifester vos rêves
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => setOpenAuthDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        Se connecter
                      </Button>
                    </Box>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                        {isQuotaReached() ? (
                          <Box sx={{ color: 'error.main' }}>
                            Limite de 18 vœux atteinte aujourd'hui. Revenez demain !
                          </Box>
                        ) : (
                          "Écrivez votre intention"
                        )}
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Je manifeste..."
                            variant="outlined"
                            value={objectif}
                            onChange={(e) => setObjectif(e.target.value)}
                            multiline
                            rows={4}
                            disabled={isQuotaReached()}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                  borderColor: 'primary.light',
                                },
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Heure de manifestation</InputLabel>
                            <Select
                              value={selectedTime}
                              label="Heure de manifestation"
                              onChange={(e) => setSelectedTime(e.target.value)}
                              disabled={isQuotaReached()}
                            >
                              <MenuItem value="9" disabled={!canAddVoeu('9') || isQuotaReached()}>
                                9h ({getVoeuxCount('9')}/3 vœux)
                              </MenuItem>
                              <MenuItem value="12" disabled={!canAddVoeu('12') || isQuotaReached()}>
                                12h ({getVoeuxCount('12')}/6 vœux)
                              </MenuItem>
                              <MenuItem value="15" disabled={!canAddVoeu('15') || isQuotaReached()}>
                                15h ({getVoeuxCount('15')}/9 vœux)
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            type="date"
                            fullWidth
                            label="Date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            disabled={isQuotaReached()}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>
                      </Grid>

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading || isQuotaReached()}
                        sx={{ mt: 3 }}
                      >
                        {isQuotaReached() ? "Limite atteinte pour aujourd'hui" : "Manifester"}
                      </Button>
                      {loading && (
                        <LinearProgress 
                          sx={{ 
                            mt: 2,
                            borderRadius: 5,
                            height: 6,
                            backgroundColor: 'secondary.light'
                          }} 
                        />
                      )}
                    </form>
                  )}
                </Paper>

                {user && (
                  <Box sx={{ mt: 6 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: 'primary.dark', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      Mes Manifestations
                      <Chip 
                        label={`${manifestationsCount}/18 aujourd'hui`}
                        color={manifestationsCount >= 18 ? "success" : "primary"}
                        sx={{ ml: 2 }}
                      />
                    </Typography>
                    {objectifs
                      .filter(obj => new Date(obj.date).toDateString() === selectedDate.toDateString())
                      .map((obj, index) => (
                      <Fade in timeout={500 + (index * 100)} key={index}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3, 
                            mb: 2, 
                            borderRadius: 4,
                            borderLeft: 6,
                            borderColor: 'secondary.main',
                            transition: 'all 0.3s ease-in-out',
                            transform: 'translateX(0)',
                            '&:hover': {
                              transform: 'translateX(8px) translateY(-2px)',
                              boxShadow: '0 8px 32px 0 rgba(156, 39, 176, 0.15)',
                            }
                          }}
                        >
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontSize: '1.1rem', 
                              color: 'primary.dark', 
                              fontWeight: 500,
                              lineHeight: 1.6
                            }}
                          >
                            {obj.text}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.1)
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              Prévu pour {obj.time}h
                            </Typography>
                            <Chip 
                              label={`${obj.repetitions} répétitions`}
                              color="secondary"
                              size="small"
                              sx={{
                                background: `linear-gradient(45deg, ${purple[700]} 30%, ${pink[400]} 90%)`,
                                color: 'white'
                              }}
                            />
                          </Box>
                        </Paper>
                      </Fade>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Colonne de droite : Résumé */}
            {user && (
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                    Progression du jour
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      Objectif quotidien : 18 manifestations
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(manifestationsCount / 18) * 100}
                      sx={{ 
                        mt: 1,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(45deg, ${purple[700]} 30%, ${pink[400]} 90%)`,
                          borderRadius: 5
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Dialog open={openAuthDialog} onClose={() => setOpenAuthDialog(false)}>
            <DialogTitle>{isLogin ? 'Connexion' : 'Inscription'}</DialogTitle>
            <form onSubmit={handleAuth}>
              <DialogContent>
                {!isLogin && (
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Nom"
                    type="text"
                    fullWidth
                    value={authData.name}
                    onChange={(e) => setAuthData({...authData, name: e.target.value})}
                    required
                  />
                )}
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  value={authData.email}
                  onChange={(e) => setAuthData({...authData, email: e.target.value})}
                  required
                />
                <TextField
                  margin="dense"
                  label="Mot de passe"
                  type="password"
                  fullWidth
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  required
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Créer un compte' : 'Déjà un compte ?'}
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {isLogin ? 'Se connecter' : 'S\'inscrire'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={() => setSnackbar({...snackbar, open: false})}
          >
            <Alert 
              onClose={() => setSnackbar({...snackbar, open: false})} 
              severity={snackbar.severity}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 