const listaSchema = require('../validators/listaValidator');

exports.createLista = (req, res, next) => {
    const { error } = listaSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: "Datos inválidos", detalles: error.details });
    }
    try {
        // ...resto del código para insertar la lista...
    } catch (err) {
        next(err);
    }
};