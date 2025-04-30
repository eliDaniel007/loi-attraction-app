const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loi-attraction', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// Schéma pour les objectifs
const objectifSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  repetitions: { type: Number, required: true }
});

const Objectif = mongoose.model('Objectif', objectifSchema);

// Vérification des identifiants
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'eli';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '9009';

// Route de connexion simplifiée
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Identifiants incorrects' });
  }
});

// Middleware de vérification du token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Routes protégées pour les objectifs
app.get('/api/objectifs', verifyToken, async (req, res) => {
  try {
    const objectifs = await Objectif.find().sort({ date: -1 });
    res.json(objectifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/objectifs', verifyToken, async (req, res) => {
  try {
    const objectif = new Objectif(req.body);
    await objectif.save();
    res.status(201).json(objectif);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/objectifs/:id', verifyToken, async (req, res) => {
  try {
    await Objectif.findByIdAndDelete(req.params.id);
    res.json({ message: 'Objectif supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`)); 