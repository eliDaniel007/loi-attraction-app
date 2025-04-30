import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ObjectifForm = () => {
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('9');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Veuillez entrer un objectif');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/objectifs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text,
          date,
          time,
          repetitions: 3
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      setText('');
      setError('');
    } catch (err) {
      setError('Impossible de sauvegarder votre objectif');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Ajouter un objectif
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Votre objectif"
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            renderInput={(params) => <TextField {...params} sx={{ mb: 2 }} />}
          />
        </LocalizationProvider>

        <TextField
          fullWidth
          select
          label="Heure"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          SelectProps={{
            native: true,
          }}
          sx={{ mb: 2 }}
        >
          <option value="9">9h</option>
          <option value="12">12h</option>
          <option value="15">15h</option>
        </TextField>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Ajouter
        </Button>
      </form>
    </Paper>
  );
};

export default ObjectifForm; 