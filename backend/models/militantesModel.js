const db = require('../config/db');

const Militantes = {
  getAll: () => db.query('SELECT * FROM militantes'),
  getById: (id) => db.query('SELECT * FROM militantes WHERE id = ?', [id]),
  create: (data) => db.query('INSERT INTO militantes SET ?', data),
  update: (id, data) => db.query('UPDATE militantes SET ? WHERE id = ?', [data, id]),
  delete: (id) => db.query('DELETE FROM militantes WHERE id = ?', [id])
};

module.exports = Militantes;