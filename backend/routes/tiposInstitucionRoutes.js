const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middlewares/auth');
const { verificarPermiso } = require('../middlewares/roles');

router.get('/', auth, verificarPermiso('read'), async (req, res) => {
  const [tipos] = await db.query('SELECT nombre FROM tipos_institucion');
  res.json(tipos);
});

router.post('/', auth, verificarPermiso('write'), async (req, res) => {
  const { nombre } = req.body;
  await db.query('INSERT IGNORE INTO tipos_institucion (nombre) VALUES (?)', [nombre]);
  res.json({ message: 'Tipo agregado' });
});

module.exports = router;