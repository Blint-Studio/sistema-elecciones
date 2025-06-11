const db = require('../config/db');

const EncargadosEscuela = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM encargados_escuela', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM encargados_escuela WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  create: (data) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO encargados_escuela SET ?', data, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...data });
      });
    });
  },

  update: (id, data) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE encargados_escuela SET ? WHERE id = ?', [data, id], (err) => {
        if (err) return reject(err);
        resolve({ id, ...data });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM encargados_escuela WHERE id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};

module.exports = EncargadosEscuela;