const XLSX = require('xlsx');
const db = require('../config/db');

const workbook = XLSX.readFile('instituciones.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

async function buscarOBarrioCrear(nombreBarrio) {
  if (!nombreBarrio) return { id: null, seccional: null };
  const [barrios] = await db.query('SELECT id, seccional_nombre FROM barrios WHERE nombre = ?', [nombreBarrio]);
  if (barrios.length > 0) {
    return { id: barrios[0].id, seccional: barrios[0].seccional_nombre || null };
  } else {
    const [result] = await db.query('INSERT INTO barrios (nombre) VALUES (?)', [nombreBarrio]);
    console.log(`Barrio agregado: ${nombreBarrio}`);
    return { id: result.insertId, seccional: null };
  }
}

async function agregarTipoInstitucion(tipo) {
  if (!tipo) return;
  await db.query('INSERT IGNORE INTO tipos_institucion (nombre) VALUES (?)', [tipo]);
}

async function importar() {
  for (const row of data) {
    try {
      // Agrega el tipo a tipos_institucion si no existe
      await agregarTipoInstitucion(row.tipo);

      // Busca o crea el barrio y obtiene id y seccional (puede ser null)
      const barrioInfo = await buscarOBarrioCrear(row.barrio);

      // Relación por defecto
      const relacion = "No hay Relacion";

      // Detectar duplicados por nombre y dirección (puedes ajustar la lógica)
      const [existentes] = await db.query(
        'SELECT id FROM instituciones WHERE nombre = ? AND direccion = ?',
        [row.nombre || null, row.direccion || null]
      );

      if (existentes.length > 0) {
        // Si existe, actualiza los datos
        await db.query(
          'UPDATE instituciones SET tipo = ?, id_barrio = ?, seccional = ?, relacion = ? WHERE id = ?',
          [
            row.tipo || null,
            barrioInfo.id,
            barrioInfo.seccional || null,
            relacion,
            existentes[0].id
          ]
        );
        console.log(`Institución actualizada: ${row.nombre}`);
      } else {
        // Si no existe, la crea
        await db.query(
          'INSERT INTO instituciones (nombre, tipo, direccion, id_barrio, seccional, relacion) VALUES (?, ?, ?, ?, ?, ?)',
          [
            row.nombre || null,
            row.tipo || null,
            row.direccion || null,
            barrioInfo.id,
            barrioInfo.seccional || null,
            relacion
          ]
        );
        console.log(`Institución agregada: ${row.nombre}`);
      }
    } catch (err) {
      console.log(`Error al importar institución: ${row.nombre || '[Sin nombre]'} - ${err.message}`);
    }
  }
  console.log('Importación finalizada');
  process.exit();
}

importar();