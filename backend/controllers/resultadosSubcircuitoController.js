const db = require('../config/db');
const SubcircuitosModel = require('../models/subcircuitosModel');

// Obtener resultados por subcircuito
exports.obtenerResultadosSubcircuito = async (req, res, next) => {
  try {
    const numeroSeccional = req.query.seccional;
    let query = `
      SELECT 
        rs.id,
        rs.fecha,
        rs.id_tipo_eleccion,
        rs.id_seccional,
        rs.total_votantes,
        rs.frente_civico,
        rs.peronismo,
        rs.otro,
        rs.total_nulos,
        rs.total_blancos,
        s.nombre AS seccional_nombre,
        CASE 
          WHEN s.subcircuito IS NULL OR s.subcircuito = '' THEN 'Sin letra'
          ELSE s.subcircuito
        END AS subcircuito_nombre,
        te.nombre AS tipo_eleccion_nombre
      FROM resultados_subcircuito rs
      LEFT JOIN seccionales s ON rs.id_seccional = s.id
      LEFT JOIN tipos_eleccion te ON rs.id_tipo_eleccion = te.id
    `;
    
    const params = [];
    if (numeroSeccional) {
      query += ` WHERE s.nombre = ?`;
      params.push(`Seccional ${numeroSeccional.padStart(2, '0')}`);
    }
    
    query += ' ORDER BY rs.fecha DESC, s.nombre ASC, s.subcircuito ASC';
    
    const [resultados] = await db.query(query, params);
    res.json(resultados);
  } catch (err) {
    console.error('Error al obtener resultados de subcircuito:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar resultados de subcircuito: ' + err.message 
    });
  }
};

// Crear nuevo resultado de subcircuito
exports.crearResultadoSubcircuito = async (req, res, next) => {
  try {
    console.log('=== DEBUG CREAR SUBCIRCUITO ===');
    console.log('req.body:', req.body);
    
    const {
      fecha,
      id_tipo_eleccion,
      numero_seccional,
      subcircuito,
      total_votantes,
      total_electores_padron,
      frente_civico,
      peronismo,
      otro,
      total_nulos,
      total_blancos
    } = req.body;

    console.log('Datos extraídos:', {
      fecha,
      id_tipo_eleccion,
      numero_seccional,
      subcircuito,
      total_votantes,
      total_electores_padron,
      frente_civico,
      peronismo,
      otro,
      total_nulos,
      total_blancos
    });

    // Validar campos obligatorios
    if (
      !fecha || !id_tipo_eleccion || !numero_seccional || !subcircuito ||
      total_votantes === undefined || total_electores_padron === undefined ||
      frente_civico === undefined || peronismo === undefined || otro === undefined ||
      total_nulos === undefined || total_blancos === undefined
    ) {
      console.log('ERROR: Campos obligatorios faltantes');
      return res.status(400).json({ 
        error: true, 
        message: "Todos los campos son obligatorios" 
      });
    }

    // Validar que los números sean positivos
    const numeros = [total_votantes, total_electores_padron, frente_civico, peronismo, otro, total_nulos, total_blancos];
    if (numeros.some(num => num < 0)) {
      console.log('ERROR: Números negativos');
      return res.status(400).json({ 
        error: true, 
        message: "Los números no pueden ser negativos" 
      });
    }

    // Validar que total_votantes no sea mayor que total_electores_padron
    if (parseInt(total_votantes) > parseInt(total_electores_padron)) {
      return res.status(400).json({ 
        error: true, 
        message: "El total de votantes no puede ser mayor al total de electores en padrón" 
      });
    }

    // Validar que la suma sea coherente
    const sumaVotos = parseInt(frente_civico) + parseInt(peronismo) + parseInt(otro) + parseInt(total_nulos) + parseInt(total_blancos);
    console.log('Suma de votos:', sumaVotos, 'Total votantes:', total_votantes);
    if (sumaVotos !== parseInt(total_votantes)) {
      console.log('ERROR: Suma no coincide');
      return res.status(400).json({ 
        error: true, 
        message: `La suma de votos (${sumaVotos}) no coincide con el total de votantes (${total_votantes})` 
      });
    }

    // Verificar que exista la seccional en nuestro modelo
    const seccionales = await SubcircuitosModel.getSeccionales();
    console.log('Seccionales disponibles:', seccionales.map(s => s.numero));
    console.log('Buscando seccional:', numero_seccional, 'tipo:', typeof numero_seccional);
    
    // Convertir numero_seccional a string con formato 01, 02, etc.
    const numeroSeccionalStr = numero_seccional.toString().padStart(2, '0');
    console.log('Número seccional formateado:', numeroSeccionalStr);
    
    const seccionalValida = seccionales.find(s => s.numero === numeroSeccionalStr);
    
    if (!seccionalValida) {
      console.log('ERROR: Seccional no válida');
      return res.status(400).json({ 
        error: true, 
        message: "La seccional especificada no es válida" 
      });
    }

    // Verificar que el subcircuito sea válido para esta seccional
    const subcircuitos = await SubcircuitosModel.getSubcircuitosBySeccional(numero_seccional);
    console.log('Subcircuitos disponibles para seccional', numero_seccional, ':', subcircuitos.map(s => s.subcircuito));
    const subcircuitoValido = subcircuitos.find(s => s.subcircuito === subcircuito);
    
    if (!subcircuitoValido) {
      console.log('ERROR: Subcircuito no válido');
      return res.status(400).json({ 
        error: true, 
        message: "El subcircuito especificado no es válido para esta seccional" 
      });
    }

    // Verificar que no exista ya un resultado para este subcircuito, tipo de elección y fecha
    const [existeResultado] = await db.query(
      'SELECT id FROM resultados_subcircuito WHERE numero_seccional = ? AND subcircuito = ? AND id_tipo_eleccion = ? AND fecha = ?',
      [numeroSeccionalStr, subcircuito, id_tipo_eleccion, fecha]
    );

    if (existeResultado.length > 0) {
      console.log('ERROR: Resultado ya existe');
      return res.status(400).json({ 
        error: true, 
        message: "Ya existe un resultado para este subcircuito, tipo de elección y fecha" 
      });
    }

    console.log('Todas las validaciones pasaron, insertando en BD...');

    // Obtener el ID de la seccional que corresponde al subcircuito
    const id_seccional = await SubcircuitosModel.getSeccionalIdByNumeroAndSubcircuito(numero_seccional, subcircuito);
    
    if (!id_seccional) {
      console.log('ERROR: No se pudo obtener id_seccional');
      return res.status(400).json({ 
        error: true, 
        message: "Error al obtener la seccional correspondiente" 
      });
    }

    console.log('ID seccional encontrado:', id_seccional, 'para seccional:', numero_seccional, 'subcircuito:', subcircuito);

    // Insertar resultado (incluimos id_barrio como NULL y total_electores_padron)
    const [result] = await db.query(
      `INSERT INTO resultados_subcircuito 
      (fecha, id_tipo_eleccion, id_seccional, id_barrio, total_votantes, total_electores_padron, frente_civico, peronismo, otro, total_nulos, total_blancos)
      VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
      [fecha, id_tipo_eleccion, id_seccional, total_votantes, total_electores_padron, frente_civico, peronismo, otro, total_nulos, total_blancos]
    );

    console.log('Resultado insertado con ID:', result.insertId);
    console.log('=== FIN DEBUG ===');

    res.status(201).json({ 
      message: "Resultado de subcircuito creado exitosamente", 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Error al crear resultado de subcircuito:', err);
    res.status(500).json({ 
      error: true, 
      message: "Error interno del servidor" 
    });
  }
};

// Eliminar resultado de subcircuito
exports.eliminarResultadoSubcircuito = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM resultados_subcircuito WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Resultado no encontrado' 
      });
    }
    
    res.json({ message: 'Resultado eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar resultado de subcircuito:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error interno del servidor' 
    });
  }
};

// Modificar resultado de subcircuito
exports.modificarResultadoSubcircuito = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      fecha,
      id_tipo_eleccion,
      id_seccional,
      id_barrio,
      total_votantes,
      frente_civico,
      peronismo,
      otro,
      total_nulos,
      total_blancos
    } = req.body;

    // Validar que la suma sea coherente
    const sumaVotos = parseInt(frente_civico) + parseInt(peronismo) + parseInt(otro) + parseInt(total_nulos) + parseInt(total_blancos);
    if (sumaVotos !== parseInt(total_votantes)) {
      return res.status(400).json({ 
        error: true, 
        message: `La suma de votos (${sumaVotos}) no coincide con el total de votantes (${total_votantes})` 
      });
    }

    const [result] = await db.query(
      `UPDATE resultados_subcircuito SET 
       fecha = ?, id_tipo_eleccion = ?, id_seccional = ?, id_barrio = ?, 
       total_votantes = ?, frente_civico = ?, peronismo = ?, otro = ?, 
       total_nulos = ?, total_blancos = ?
       WHERE id = ?`,
      [fecha, id_tipo_eleccion, id_seccional, id_barrio, total_votantes, frente_civico, peronismo, otro, total_nulos, total_blancos, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Resultado no encontrado' 
      });
    }
    
    res.json({ message: 'Resultado modificado exitosamente' });
  } catch (err) {
    console.error('Error al modificar resultado de subcircuito:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error interno del servidor' 
    });
  }
};
