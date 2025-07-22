const db = require('../config/db');

const Mesas = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM mesas', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM mesas WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  getByEscuela: (escuela_id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM mesas WHERE escuela_id = ? ORDER BY numero_mesa ASC', [escuela_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  create: (data) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO mesas SET ?', data, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...data });
      });
    });
  },

  update: (id, data) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE mesas SET ? WHERE id = ?', [data, id], (err) => {
        if (err) return reject(err);
        resolve({ id, ...data });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM mesas WHERE id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};

module.exports = Mesas;