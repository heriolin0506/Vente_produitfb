const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- FANOMANANA NY "MULTER" (Upload) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- FIDIRANA (LOGIN) ---
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM admin WHERE email = ?', [email], async (err, admin) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!admin) return res.status(401).json({ message: "Diso ny email na password" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Diso ny email na password" });

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, message: "Tafiditra soa aman-tsara" });
    });
});

// --- HANOVA NY MOT DE PASSE ---
router.post('/change-password', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Tsy tafiditra" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { oldPassword, newPassword } = req.body;

        // Hamarino ny mot de passe taloha
        db.get('SELECT * FROM admin WHERE id = ?', [decoded.id], async (err, admin) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!admin) return res.status(404).json({ message: "Tsy hita ny admin" });

            const isMatch = await bcrypt.compare(oldPassword, admin.password);
            if (!isMatch) return res.status(401).json({ message: "Diso ny mot de passe taloha" });

            // Hahé ny mot de passe vaovao
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.run('UPDATE admin SET password = ? WHERE id = ?', [hashedPassword, decoded.id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Vita soa aman-tsara ny fanovana" });
            });
        });
    } catch (err) {
        res.status(401).json({ message: "Token diso" });
    }
});

// --- MAKA NY VOKATRA REHETRA ---
router.get('/produits', (req, res) => {
    db.all('SELECT * FROM produits ORDER BY date_ajout DESC', [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatted = results.map(p => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : []
        }));
        res.json(formatted);
    });
});

// --- MAKA VOKATRA IRAY ---
router.get('/produits/:id', (req, res) => {
    db.get('SELECT * FROM produits WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result) return res.status(404).json({ message: "Tsy hita ny vokatra" });
        result.images = result.images ? JSON.parse(result.images) : [];
        res.json(result);
    });
});

// --- HAMORONA VOKATRA VAOVAO (Upload + URL) ---
router.post('/produits', upload.array('images', 5), (req, res) => {
    const { nom, categorie, marque, prix, stock, description, specs, imagesUrl } = req.body;
    
    // 1. Sary avy amin'ny FICHIER
    const uploadedImages = (req.files || []).map((file, index) => ({
        url: `/uploads/${file.filename}`,
        position: index + 1
    }));

    // 2. Sary avy amin'ny URL
    const urlImages = imagesUrl ? imagesUrl.split('\n').filter(u => u.trim() !== '').map((url, index) => ({
        url: url.trim(),
        position: uploadedImages.length + index + 1
    })) : [];

    // 3. Hampifangaro (Fichier + URL), fetra 5
    const allImages = [...uploadedImages, ...urlImages].slice(0, 5);

    db.run(
        `INSERT INTO produits (nom, categorie, marque, prix, stock, description, specs, images) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nom, categorie, marque, prix, stock, description, specs, JSON.stringify(allImages)],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Vokatra vaovao voatahiry" });
        }
    );
});

// --- MANOVA VOKATRA (Upload + URL) ---
// --- MANOVA VOKATRA (Upload + URL) ---
router.put('/produits/:id', upload.array('images', 5), (req, res) => {
    const { nom, categorie, marque, prix, stock, description, specs, imagesUrl } = req.body;
    
    // Makà ny sary taloha
    db.get('SELECT images FROM produits WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const oldImages = result && result.images ? JSON.parse(result.images) : [];
        
        // Sary vaovao avy amin'ny Upload
        const uploadedImages = (req.files || []).map((file, index) => ({
            url: `/uploads/${file.filename}`,
            position: oldImages.length + index + 1
        }));
        
        // Sary avy amin'ny URL (raha misy)
        const urlImages = imagesUrl ? imagesUrl.split('\n').filter(u => u.trim() !== '').map((url, index) => ({
            url: url.trim(),
            position: oldImages.length + uploadedImages.length + index + 1
        })) : [];
        
        // Hampifangaro: Sary taloha + Sary vaovao (fetra 5)
        const allImages = [...oldImages, ...uploadedImages, ...urlImages].slice(0, 5);
        
        db.run(
            `UPDATE produits SET nom=?, categorie=?, marque=?, prix=?, stock=?, description=?, specs=?, images=? WHERE id=?`,
            [nom, categorie, marque, prix, stock, description, specs, JSON.stringify(allImages), req.params.id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Vokatra nohavaozina" });
            }
        );
    });
});

// --- MAMFA VOKATRA ---
router.delete('/produits/:id', (req, res) => {
    db.run('DELETE FROM produits WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Vokatra voafafa" });
    });
});

module.exports = router;