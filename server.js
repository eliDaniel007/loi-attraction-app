const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB avec plus de logs
console.log('Tentative de connexion à MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loi-attraction', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connecté à MongoDB avec succès');
})
.catch((error) => {
  console.error('❌ Erreur de connexion à MongoDB:', error);
});

// Vérifier la connexion
mongoose.connection.on('error', err => {
  console.error('Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB déconnecté');
});

// Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Schéma pour les objectifs
const objectifSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  repetitions: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Objectif = mongoose.model('Objectif', objectifSchema);

// Routes d'authentification avec plus de logs
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log("Tentative d'inscription avec:", { email: req.body.email, name: req.body.name });
    const { email, password, name } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email déjà utilisé:", email);
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();
    console.log("✅ Nouvel utilisateur créé:", { email, name });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur lors de la création du compte: " + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Routes protégées pour les objectifs
app.get('/api/objectifs', auth, async (req, res) => {
  try {
    const objectifs = await Objectif.find({ userId: req.user.userId });
    res.json(objectifs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des objectifs' });
  }
});

app.post('/api/objectifs', auth, async (req, res) => {
  try {
    const { text, date, time, repetitions } = req.body;
    const objectif = new Objectif({
      text,
      date,
      time,
      repetitions,
      userId: req.user.userId
    });
    await objectif.save();
    res.status(201).json(objectif);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la sauvegarde de l\'objectif' });
  }
});

// Configuration des rappels avec node-cron
cron.schedule('0 9 * * *', () => {
  // Rappel à 9h
  console.log('Rappel à 9h - Écrivez vos objectifs 3 fois');
});

cron.schedule('0 12 * * *', () => {
  // Rappel à 12h
  console.log('Rappel à 12h - Écrivez vos objectifs 6 fois');
});

cron.schedule('0 15 * * *', () => {
  // Rappel à 15h
  console.log('Rappel à 15h - Écrivez vos objectifs 9 fois');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 