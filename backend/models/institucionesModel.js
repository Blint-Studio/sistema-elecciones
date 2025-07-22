const db = require('../config/db');

const Instituciones = {
  getAll: () => db.query('SELECT * FROM instituciones'),
  getById: (id) => db.query('SELECT * FROM instituciones WHERE id = ?', [id]),
  create: (data) => db.query('INSERT INTO instituciones SET ?', data),
  update: (id, data) => db.query('UPDATE instituciones SET ? WHERE id = ?', [data, id]),
  delete: (id) => db.query('DELETE FROM instituciones WHERE id = ?', [id])
};

module.exports = Instituciones;