const db = require('../config/db');

const EncargadosSeccional = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM encargados_seccional', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM encargados_seccional WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  create: (data) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO encargados_seccional SET ?', data, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...data });
      });
    });
  },

  update: (id, data) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE encargados_seccional SET ? WHERE id = ?', [data, id], (err) => {
        if (err) return reject(err);
        resolve({ id, ...data });
      });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM encargados_seccional WHERE id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};

module.exports = EncargadosSeccional;