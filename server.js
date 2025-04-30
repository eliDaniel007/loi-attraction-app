const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/loi-attraction-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Schéma pour les objectifs
const objectiveSchema = new mongoose.Schema({
    title: String,
    description: String,
    deadline: Date,
    status: String,
    createdAt: { type: Date, default: Date.now }
});

const Objective = mongoose.model('Objective', objectiveSchema);

// Routes pour les objectifs
app.get('/api/objectives', async (req, res) => {
    try {
        const objectives = await Objective.find();
        res.json(objectives);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/objectives', async (req, res) => {
    const objective = new Objective(req.body);
    try {
        const newObjective = await objective.save();
        res.status(201).json(newObjective);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/objectives/:id', async (req, res) => {
    try {
        const updatedObjective = await Objective.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedObjective);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/objectives/:id', async (req, res) => {
    try {
        await Objective.findByIdAndDelete(req.params.id);
        res.json({ message: 'Objectif supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 