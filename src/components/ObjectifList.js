import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ObjectifList = () => {
  const [objectifs, setObjectifs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchObjectifs();
  }, []);

  const fetchObjectifs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/objectifs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data = await response.json();
      setObjectifs(data);
    } catch (err) {
      setError('Impossible de charger les objectifs');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/objectifs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      setObjectifs(objectifs.filter(obj => obj._id !== id));
    } catch (err) {
      setError('Impossible de supprimer l\'objectif');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Mes objectifs
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {objectifs.length === 0 ? (
        <Typography color="text.secondary">
          Aucun objectif pour le moment
        </Typography>
      ) : (
        objectifs.map((objectif) => (
          <Paper
            key={objectif._id}
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {objectif.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(objectif.date).toLocaleDateString()} à {objectif.time}h
              </Typography>
            </Box>
            <IconButton
              onClick={() => handleDelete(objectif._id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))
      )}
    </Paper>
  );
};

export default ObjectifList; 