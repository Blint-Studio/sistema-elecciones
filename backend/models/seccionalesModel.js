const db = require('../config/db');

// Obtener todas las seccionales
const getAllSeccionales = (callback) => {
    const query = 'SELECT * FROM seccionales ORDER BY nombre ASC';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, results);
    });
};

module.exports = {
    getAllSeccionales,
};
