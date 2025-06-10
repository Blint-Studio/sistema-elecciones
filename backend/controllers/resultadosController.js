const ResultadosModel = require('../models/resultadosModel');

const getResultados = (req, res) => {
    ResultadosModel.getAllResultados((err, resultados) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener resultados', detalle: err });
        }
        res.json(resultados);
    });
};

module.exports = {
    getResultados
};
