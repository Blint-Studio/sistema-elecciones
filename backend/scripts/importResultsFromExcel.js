/**
 * Script para importar resultados desde un archivo Excel a la base de datos.
 * Uso: node importResultsFromExcel.js <ruta-al-excel>
 * El Excel debe tener columna: fecha, tipo_eleccion, seccional, subcircuito,
 * total_votantes, total_electores_padron, frente_civico, peronismo, votos_nulos, votos_blanco
 */
const xlsx = require('xlsx');
const pool = require('../config/db');

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Debe pasar la ruta del archivo Excel como argumento');
    process.exit(1);
  }

  // Leer libro y primera hoja
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // Excel empieza en fila 2 de datos
    const row = rows[i];
    const {
      fecha,
      tipo_eleccion,
      seccional,
      subcircuito,
      total_votantes,
      total_electores_padron,
      frente_civico,
      peronismo,
      votos_nulos,
      votos_blanco
    } = row;

    // Validaciones básicas
    if (!fecha || !tipo_eleccion || !seccional || !total_votantes || !total_electores_padron || frente_civico == null || peronismo == null || votos_nulos == null || votos_blanco == null) {
      console.error(`Fila ${rowNum}: faltan campos obligatorios`);
      continue;
    }

    // Fecha
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj)) {
      console.error(`Fila ${rowNum}: formato de fecha inválido (${fecha})`);
      continue;
    }

    // Mapear tipo_eleccion a ID
    let tipoId = parseInt(tipo_eleccion, 10);
    if (isNaN(tipoId)) {
      const [tipoRows] = await pool.query(
        'SELECT id FROM tipos_eleccion WHERE nombre = ?',
        [tipo_eleccion]
      );
      if (!tipoRows.length) {
        console.error(`Fila ${rowNum}: tipo_eleccion desconocido (${tipo_eleccion})`);
        continue;
      }
      tipoId = tipoRows[0].id;
    }

    // Mapear seccional a ID
    let seccId = parseInt(seccional, 10);
    if (isNaN(seccId)) {
      const [secRows] = await pool.query(
        'SELECT id FROM seccionales WHERE nombre = ?',
        [seccional]
      );
      if (!secRows.length) {
        console.error(`Fila ${rowNum}: seccional desconocida (${seccional})`);
        continue;
      }
      seccId = secRows[0].id;
    }

    // Mapear subcircuito a barrio (opcional)
    let barrioId = null;
    if (subcircuito) {
      const [barrios] = await pool.query(
        'SELECT id FROM barrios WHERE id_seccional = ? AND nombre = ?',
        [seccId, subcircuito]
      );
      if (!barrios.length) {
        console.error(`Fila ${rowNum}: barrio/subcircuito desconocido (${subcircuito})`);
        continue;
      }
      barrioId = barrios[0].id;
    }

    // Campos numéricos
    const totalV = parseInt(total_votantes, 10);
    const padron = parseInt(total_electores_padron, 10);
    const fc = parseInt(frente_civico, 10);
    const peri = parseInt(peronismo, 10);
    const nulos = parseInt(votos_nulos, 10);
    const blancos = parseInt(votos_blanco, 10);
    const nums = [totalV, padron, fc, peri, nulos, blancos];
    if (nums.some(n => isNaN(n) || n < 0)) {
      console.error(`Fila ${rowNum}: valores numéricos inválidos`);
      continue;
    }
    if (totalV > padron) {
      console.error(`Fila ${rowNum}: total_votantes (${totalV}) > total_electores_padron (${padron})`);
      continue;
    }

    // Calcular "otros"
    const otros = totalV - (fc + peri + nulos + blancos);
    if (otros < 0) {
      console.error(`Fila ${rowNum}: votos exceden total_votantes`);
      continue;
    }

    // Insertar en resultados_subcircuito
    try {
      const sql = `
        INSERT INTO resultados_subcircuito
        (fecha, id_tipo_eleccion, id_seccional, id_barrio, total_votantes,
         frente_civico, peronismo, otro, total_nulos, total_blancos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(sql, [
        fechaObj,
        tipoId,
        seccId,
        barrioId,
        totalV,
        fc,
        peri,
        otros,
        nulos,
        blancos
      ]);
      console.log(`Fila ${rowNum}: insertado correctamente`);
    } catch (err) {
      console.error(`Fila ${rowNum}: error al insertar ->`, err.message);
    }
  }

  console.info('Importación finalizada');
  process.exit(0);
}

main().catch(err => {
  console.error('Error en import:', err);
  process.exit(1);
});
