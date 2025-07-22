const db = require('../config/db');
const { actualizarTotalesPorSeccional } = require('../utils/seccionalUpdater');

// Obtener todos los resultados
exports.obtenerResultados = async (req, res, next) => {
  try {
    const escuelaId = req.query.escuela;
    let query = `
      SELECT 
        r.id,
        r.fecha,
        r.id_tipo_eleccion,
        r.id_escuela,
        r.id_mesa,
        r.total_votantes,
        r.total_electores_padron,
        r.frente_civico,
        r.peronismo,
        r.otro,
        r.total_nulos,
        r.total_blancos,
        m.numero_mesa,
        e.nombre AS escuela_nombre
      FROM resultados r
      LEFT JOIN mesas m ON r.id_mesa = m.id
      LEFT JOIN escuelas e ON r.id_escuela = e.id
    `;
    
    const params = [];
    if (escuelaId) {
      query += ' WHERE r.id_escuela = ?';
      params.push(escuelaId);
    }
    
    query += ' ORDER BY m.numero_mesa ASC, r.fecha DESC';
    
    const [resultados] = await db.query(query, params);
    res.json(resultados);
  } catch (err) {
    console.error('Error al obtener resultados:', err);
    
    // Si es error de columna no encontrada, enviar mensaje específico
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: true, 
        message: 'Error de estructura de base de datos. Por favor, ejecute la migración.' 
      });
    }
    
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar resultados: ' + err.message 
    });
  }
};

// Crear nuevo resultado
exports.crearResultado = async (req, res, next) => {
  try {
    const {
      fecha,
      id_tipo_eleccion,
      id_escuela,
      id_mesa,
      total_votantes,
      total_electores_padron,
      frente_civico,
      peronismo,
      otro,
      total_nulos,
      total_blancos
    } = req.body;

    // Validar campos obligatorios
    if (
      !fecha || !id_tipo_eleccion || !id_escuela || !id_mesa ||
      total_votantes === undefined || total_electores_padron === undefined ||
      frente_civico === undefined || peronismo === undefined || otro === undefined ||
      total_nulos === undefined || total_blancos === undefined
    ) {
      return res.status(400).json({ 
        error: true, 
        message: "Todos los campos son obligatorios" 
      });
    }

    // Validar que los números sean positivos
    const numeros = [total_votantes, total_electores_padron, frente_civico, peronismo, otro, total_nulos, total_blancos];
    if (numeros.some(num => num < 0)) {
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
    if (sumaVotos !== parseInt(total_votantes)) {
      return res.status(400).json({ 
        error: true, 
        message: `La suma de votos (${sumaVotos}) no coincide con el total de votantes (${total_votantes})` 
      });
    }

    // Verificar que la mesa pertenezca a la escuela
    const [mesaCheck] = await db.query(
      'SELECT id FROM mesas WHERE id = ? AND escuela_id = ?',
      [id_mesa, id_escuela]
    );

    if (mesaCheck.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: "La mesa seleccionada no pertenece a la escuela indicada" 
      });
    }

    // Verificar que no exista ya un resultado para esta mesa y tipo de elección
    const [existeResultado] = await db.query(
      'SELECT id FROM resultados WHERE id_mesa = ? AND id_tipo_eleccion = ?',
      [id_mesa, id_tipo_eleccion]
    );

    if (existeResultado.length > 0) {
      return res.status(400).json({ 
        error: true, 
        message: "Ya existe un resultado para esta mesa y tipo de elección" 
      });
    }

    // Insertar resultado
    const [result] = await db.query(
      `INSERT INTO resultados 
      (fecha, id_tipo_eleccion, id_escuela, id_mesa, total_votantes, total_electores_padron, frente_civico, peronismo, otro, total_nulos, total_blancos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fecha, id_tipo_eleccion, id_escuela, id_mesa, total_votantes, total_electores_padron, frente_civico, peronismo, otro, total_nulos, total_blancos]
    );

    // Obtener información de la escuela para actualizar totales por seccional
    const [escuelaInfo] = await db.query(
      'SELECT seccional_nombre FROM escuelas WHERE id = ?',
      [id_escuela]
    );

    if (escuelaInfo.length > 0) {
      try {
        // Actualizar automáticamente los totales por seccional
        await actualizarTotalesPorSeccional(
          escuelaInfo[0].seccional_nombre,
          id_tipo_eleccion,
          fecha
        );
        console.log(`✓ Totales actualizados para seccional ${escuelaInfo[0].seccional_nombre}`);
      } catch (updateError) {
        console.error('Error al actualizar totales por seccional:', updateError);
        // No fallar la operación principal por esto
      }
    }

    res.status(201).json({ 
      message: "Resultado creado exitosamente", 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Error al crear resultado:', err);
    res.status(500).json({ 
      error: true, 
      message: "Error interno del servidor" 
    });
  }
};

// Eliminar resultado
exports.eliminarResultado = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Obtener información del resultado antes de eliminarlo para actualizar totales
    const [resultadoInfo] = await db.query(`
      SELECT r.fecha, r.id_tipo_eleccion, e.seccional_nombre 
      FROM resultados r 
      LEFT JOIN escuelas e ON r.id_escuela = e.id 
      WHERE r.id = ?
    `, [id]);
    
    const [result] = await db.query('DELETE FROM resultados WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Resultado no encontrado' 
      });
    }

    // Actualizar totales por seccional tras eliminación
    if (resultadoInfo.length > 0) {
      try {
        await actualizarTotalesPorSeccional(
          resultadoInfo[0].seccional_nombre,
          resultadoInfo[0].id_tipo_eleccion,
          resultadoInfo[0].fecha
        );
        console.log(`✓ Totales actualizados para seccional ${resultadoInfo[0].seccional_nombre} tras eliminación`);
      } catch (updateError) {
        console.error('Error al actualizar totales por seccional:', updateError);
      }
    }
    
    res.json({ message: 'Resultado eliminado exitosamente' });
  } catch (err) {
    next(err);
  }
};

// Modificar resultado
exports.modificarResultado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      fecha,
      id_tipo_eleccion,
      id_escuela,
      id_mesa,
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
      `UPDATE resultados SET 
       fecha = ?, id_tipo_eleccion = ?, id_escuela = ?, id_mesa = ?, 
       total_votantes = ?, frente_civico = ?, peronismo = ?, otro = ?, 
       total_nulos = ?, total_blancos = ?
       WHERE id = ?`,
      [fecha, id_tipo_eleccion, id_escuela, id_mesa, total_votantes, frente_civico, peronismo, otro, total_nulos, total_blancos, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Resultado no encontrado' 
      });
    }

    // Obtener información de la escuela para actualizar totales por seccional
    const [escuelaInfo] = await db.query(
      'SELECT seccional_nombre FROM escuelas WHERE id = ?',
      [id_escuela]
    );

    if (escuelaInfo.length > 0) {
      try {
        // Actualizar automáticamente los totales por seccional
        await actualizarTotalesPorSeccional(
          escuelaInfo[0].seccional_nombre,
          id_tipo_eleccion,
          fecha
        );
        console.log(`✓ Totales actualizados para seccional ${escuelaInfo[0].seccional_nombre} tras modificación`);
      } catch (updateError) {
        console.error('Error al actualizar totales por seccional:', updateError);
        // No fallar la operación principal por esto
      }
    }
    
    res.json({ message: 'Resultado modificado exitosamente' });
  } catch (err) {
    next(err);
  }
};

// Obtener todos los resultados combinados con filtros avanzados
exports.obtenerResultadosCombinados = async (req, res, next) => {
  try {
    const { 
      seccionales, 
      subcircuitos, 
      tipo_eleccion, 
      anio 
    } = req.query;

    console.log('Parámetros recibidos:', { seccionales, subcircuitos, tipo_eleccion, anio });

    let resultados = [];

    // Query básica para resultados por escuela (mesas) - sin filtros complejos primero
    try {
      let queryEscuelas = `
        SELECT 
          r.id,
          r.fecha,
          r.id_tipo_eleccion,
          r.total_votantes,
          r.total_electores_padron,
          COALESCE(r.frente_civico, 0) AS frente_civico,
          COALESCE(r.peronismo, 0) AS peronismo,
          COALESCE(r.otro, 0) AS otro,
          COALESCE(r.total_nulos, 0) AS total_nulos,
          COALESCE(r.total_blancos, 0) AS total_blancos,
          e.nombre AS escuela_nombre,
          COALESCE(m.numero_mesa, 'N/A') AS numero_mesa,
          COALESCE(e.seccional_nombre, 'N/A') AS seccional_nombre,
          COALESCE(e.subcircuito, 'N/A') AS subcircuito,
          'escuela' AS origen
        FROM resultados r
        LEFT JOIN mesas m ON r.id_mesa = m.id
        LEFT JOIN escuelas e ON r.id_escuela = e.id
        WHERE 1=1
      `;

      let paramsEscuelas = [];

      // Aplicar filtros uno por uno
      if (seccionales) {
        const seccionalesArray = seccionales.split(',').map(s => s.trim());
        const seccionalesNombres = seccionalesArray.map(s => `Seccional ${s.padStart(2, '0')}`);
        const placeholders = seccionalesNombres.map(() => '?').join(',');
        queryEscuelas += ` AND e.seccional_nombre IN (${placeholders})`;
        paramsEscuelas.push(...seccionalesNombres);
      }

      if (tipo_eleccion) {
        queryEscuelas += ' AND r.id_tipo_eleccion = ?';
        paramsEscuelas.push(tipo_eleccion);
      }

      if (anio) {
        queryEscuelas += ' AND YEAR(r.fecha) = ?';
        paramsEscuelas.push(anio);
      }

      queryEscuelas += ' ORDER BY m.numero_mesa ASC, r.fecha DESC LIMIT 100';

      console.log('Ejecutando query escuelas:', queryEscuelas);
      console.log('Parámetros escuelas:', paramsEscuelas);

      const [resultadosEscuelas] = await db.query(queryEscuelas, paramsEscuelas);
      console.log(`Resultados escuelas encontrados: ${resultadosEscuelas.length}`);
      
      // Agregar información del tipo de elección
      for (let resultado of resultadosEscuelas) {
        try {
          const [tipoEleccion] = await db.query(
            'SELECT nombre FROM tipos_eleccion WHERE id = ?', 
            [resultado.id_tipo_eleccion]
          );
          resultado.tipo_eleccion_nombre = tipoEleccion.length > 0 ? tipoEleccion[0].nombre : 'N/A';
        } catch (err) {
          resultado.tipo_eleccion_nombre = 'N/A';
        }
      }

      resultados.push(...resultadosEscuelas);
    } catch (err) {
      console.error('Error en query de escuelas:', err);
    }

    // Query para resultados por subcircuito
    try {
      let querySubcircuitos = `
        SELECT 
          rs.id,
          rs.fecha,
          rs.id_tipo_eleccion,
          rs.total_votantes,
          rs.total_electores_padron,
          COALESCE(rs.frente_civico, 0) AS frente_civico,
          COALESCE(rs.peronismo, 0) AS peronismo,
          COALESCE(rs.otro, 0) AS otro,
          COALESCE(rs.total_nulos, 0) AS total_nulos,
          COALESCE(rs.total_blancos, 0) AS total_blancos,
          NULL AS escuela_nombre,
          NULL AS numero_mesa,
          COALESCE(s.nombre, 'N/A') AS seccional_nombre,
          CASE 
            WHEN s.subcircuito IS NULL OR s.subcircuito = '' THEN 'Sin letra'
            ELSE s.subcircuito
          END AS subcircuito,
          'subcircuito' AS origen
        FROM resultados_subcircuito rs
        LEFT JOIN seccionales s ON rs.id_seccional = s.id
        WHERE 1=1
      `;

      let paramsSubcircuitos = [];

      if (seccionales) {
        const seccionalesArray = seccionales.split(',').map(s => s.trim());
        const seccionalesNombres = seccionalesArray.map(s => `Seccional ${s.padStart(2, '0')}`);
        const placeholders = seccionalesNombres.map(() => '?').join(',');
        querySubcircuitos += ` AND s.nombre IN (${placeholders})`;
        paramsSubcircuitos.push(...seccionalesNombres);
      }

      if (tipo_eleccion) {
        querySubcircuitos += ' AND rs.id_tipo_eleccion = ?';
        paramsSubcircuitos.push(tipo_eleccion);
      }

      if (anio) {
        querySubcircuitos += ' AND YEAR(rs.fecha) = ?';
        paramsSubcircuitos.push(anio);
      }

      querySubcircuitos += ' ORDER BY rs.fecha DESC LIMIT 100';

      console.log('Ejecutando query subcircuitos:', querySubcircuitos);
      console.log('Parámetros subcircuitos:', paramsSubcircuitos);

      const [resultadosSubcircuitosData] = await db.query(querySubcircuitos, paramsSubcircuitos);
      console.log(`Resultados subcircuitos encontrados: ${resultadosSubcircuitosData.length}`);

      // Agregar información del tipo de elección
      for (let resultado of resultadosSubcircuitosData) {
        try {
          const [tipoEleccion] = await db.query(
            'SELECT nombre FROM tipos_eleccion WHERE id = ?', 
            [resultado.id_tipo_eleccion]
          );
          resultado.tipo_eleccion_nombre = tipoEleccion.length > 0 ? tipoEleccion[0].nombre : 'N/A';
        } catch (err) {
          resultado.tipo_eleccion_nombre = 'N/A';
        }
      }

      resultados.push(...resultadosSubcircuitosData);
    } catch (err) {
      console.error('Error en query de subcircuitos:', err);
    }

    // Filtrar por subcircuitos específicos si se especificaron
    if (subcircuitos) {
      const subcircuitosArray = subcircuitos.split(',').map(s => s.trim());
      resultados = resultados.filter(r => {
        return subcircuitosArray.includes(r.subcircuito);
      });
    }

    // Procesar los resultados para extraer solo el número de seccional
    resultados = resultados.map(r => ({
      ...r,
      numero_seccional: r.seccional_nombre && r.seccional_nombre !== 'N/A' ? 
        r.seccional_nombre.replace('Seccional ', '').padStart(2, '0') : 
        'N/A'
    }));

    // Ordenar resultados combinados
    resultados.sort((a, b) => {
      // Primero por número de mesa (para escuelas)
      if (a.numero_mesa !== 'N/A' && b.numero_mesa !== 'N/A') {
        const mesaA = parseInt(a.numero_mesa) || 999999;
        const mesaB = parseInt(b.numero_mesa) || 999999;
        if (mesaA !== mesaB) {
          return mesaA - mesaB;
        }
      }
      
      // Luego por seccional
      const seccionalA = parseInt(a.numero_seccional) || 999;
      const seccionalB = parseInt(b.numero_seccional) || 999;
      if (seccionalA !== seccionalB) {
        return seccionalA - seccionalB;
      }

      // Luego por origen (escuela primero)
      if (a.origen !== b.origen) {
        return a.origen === 'escuela' ? -1 : 1;
      }

      // Finalmente por fecha (más reciente primero)
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return fechaB.getTime() - fechaA.getTime();
    });

    console.log(`Total resultados devueltos: ${resultados.length}`);
    res.json(resultados);
    
  } catch (err) {
    console.error('Error al obtener resultados combinados:', err);
    res.status(500).json({ 
      error: true, 
      message: 'Error al cargar resultados: ' + err.message 
    });
  }
};
