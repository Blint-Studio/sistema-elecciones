const db = require('../config/db');

exports.paneoSeccionales = async (req, res, next) => {
  try {
    const seccionalesData = [];
    
    // Determinar qué seccionales mostrar según el usuario
    let seccionalesToMostrar = [];
    
    if (req.user && req.user.rol === 'seccional' && req.user.seccional_asignada) {
      // Usuario seccional: solo mostrar su seccional
      seccionalesToMostrar = [req.user.seccional_asignada];
      console.log(`👤 Dashboard: Usuario seccional ${req.user.seccional_asignada} - mostrando solo su seccional`);
    } else {
      // Admin, super_admin o acceso público: mostrar todas las 14 seccionales
      seccionalesToMostrar = Array.from({length: 14}, (_, i) => i + 1);
      console.log('👑 Dashboard: Usuario admin/público - mostrando todas las seccionales');
    }
    
    // Generar datos para cada seccional a mostrar
    for (let i of seccionalesToMostrar) {
      // Buscar datos para esta seccional específica
      const [result] = await db.query(`
        SELECT 
          ? as seccional_id,
          ? as seccional_nombre,
          COUNT(DISTINCT b.id) as total_barrios,
          COUNT(DISTINCT inst.id) as total_instituciones,
          COUNT(DISTINCT m.id) as total_militantes
        FROM barrios b
        LEFT JOIN instituciones inst ON inst.id_barrio = b.id
        LEFT JOIN militantes m ON m.id_barrio = b.id
        WHERE (b.seccional_nombre = ? OR b.seccional_nombre = ?)
      `, [
        i,
        `Seccional ${i}`,
        `Seccional ${i}`,
        `Seccional ${i.toString().padStart(2, '0')}`
      ]);
      
      if (result && result.length > 0) {
        seccionalesData.push(result[0]);
      } else {
        seccionalesData.push({
          seccional_id: i,
          seccional_nombre: `Seccional ${i}`,
          total_barrios: 0,
          total_instituciones: 0,
          total_militantes: 0
        });
      }
    }
    
    console.log(`🎯 Dashboard: Devolviendo ${seccionalesData.length} seccionales`);
    res.json(seccionalesData);
    
  } catch (err) {
    console.error('❌ Error en dashboard:', err);
    next(err);
  }
};