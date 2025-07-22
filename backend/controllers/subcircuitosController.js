const SubcircuitosModel = require('../models/subcircuitosModel');

// Obtener las 14 seccionales principales
exports.obtenerSeccionales = async (req, res, next) => {
  try {
    const seccionales = await SubcircuitosModel.getSeccionales();
    res.json(seccionales);
  } catch (err) {
    console.error('Error al obtener seccionales:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar seccionales: ' + err.message 
    });
  }
};

// Obtener subcircuitos de una seccional
exports.obtenerSubcircuitosPorSeccional = async (req, res, next) => {
  try {
    const numeroSeccional = req.query.seccional;
    if (!numeroSeccional) {
      return res.status(400).json({ 
        error: true, 
        message: 'Número de seccional requerido' 
      });
    }
    
    const subcircuitos = await SubcircuitosModel.getSubcircuitosBySeccional(numeroSeccional);
    res.json(subcircuitos);
  } catch (err) {
    console.error('Error al obtener subcircuitos:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar subcircuitos: ' + err.message 
    });
  }
};
