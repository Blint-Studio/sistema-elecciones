const db = require('../config/db');

const Barrios = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM barrios', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM barrios WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  create: (data) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO barrios SET ?', data, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...data });
      });
    });
  },

  update: (id, data) => {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE barrios SET nombre = ?, seccional_nombre = ?, subcircuito = ? WHERE id = ?',
        [data.nombre, data.seccional_nombre, data.subcircuito, id],
        (err) => {
          if (err) return reject(err);
          resolve({ id, ...data });
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM barrios WHERE id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};

module.exports = Barrios;