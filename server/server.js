const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hanolotra ny fichiers ao amin'ny /public
app.use(express.static(path.join(__dirname, '../public')));
// Hampiseho ny sary voatahiry
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// Hampiasa ny routes
app.use('/api', routes);

// Fanombohana ny server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server mandeha amin'ny port ${PORT}`);
});

// --- FAMORONANA NY ADMIN USER (Raha mbola tsy misy) ---
const bcrypt = require('bcryptjs');
db.get('SELECT * FROM admin WHERE email = ?', ['admin@impact-pc.mg'], async (err, admin) => {
    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        db.run('INSERT INTO admin (email, password) VALUES (?, ?)', ['admin@impact-pc.mg', hashedPassword], (err) => {
            if (err) console.error("Error amin'ny famoronana admin:", err.message);
            else console.log("Admin user voaforona: admin@impact-pc.mg / admin123");
        });
    } else {
        console.log("Efa misy ny admin user.");
    }
});