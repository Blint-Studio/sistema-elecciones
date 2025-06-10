const SeccionalesModel = require('../models/seccionalesModel');

// Controlador para obtener todas las seccionales
const getSeccionales = (req, res) => {
    SeccionalesModel.getAllSeccionales((err, seccionales) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener seccionales', error: err });
        }
        res.json(seccionales);
    });
};

module.exports = {
    getSeccionales,
};
