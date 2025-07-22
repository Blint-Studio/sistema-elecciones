const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// Conexión
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678", // Cambiar según tu configuración
  database: "elecciones_cordoba"
});

// Usuarios de prueba
const usuarios = [
  {
    nombre: "Admin Córdoba",
    email: "admin@cordoba.com",
    password: "admin123",
    rol: "admin"
  },
  {
    nombre: "Operador Carga",
    email: "operador@cordoba.com",
    password: "operador123",
    rol: "operador"
  },
  {
    nombre: "Lector Consulta",
    email: "lector@cordoba.com",
    password: "lector123",
    rol: "lector"
  },
  {
    nombre: "Martin Juez",
    email: "Martin Juez",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Agustin Nostrala",
    email: "Agustin Nostrala",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Cuni Arias",
    email: "Cuni Arias",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Gonzalo Bargas",
    email: "Gonzalo Bargas",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Nahuel Bustos",
    email: "Nahuel Bustos",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Ignacio Tello",
    email: "Ignacio Tello",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "German Flaherty",
    email: "German Flaherty",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Facundo Nostrala",
    email: "Facundo Nostrala",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Jeremias Caceres",
    email: "Jeremias Caceres",
    password: "MartinJuez2027",
    rol: "admin"
  },
  {
    nombre: "Luis Juez",
    email: "Luis Juez",
    password: "LuisJuez2027",
    rol: "admin"
  },
  {
    nombre: "Walter Nostrala",
    email: "Walter Nostrala",
    password: "LuisJuez2027",
    rol: "admin"
  },
];

async function crearUsuarios() {
  try {
    for (const usuario of usuarios) {
      const passwordHasheado = bcrypt.hashSync(usuario.password, 10);
      
      const query = `
        INSERT INTO usuarios (nombre, email, password, rol) 
        VALUES (?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        password = VALUES(password), 
        nombre = VALUES(nombre), 
        rol = VALUES(rol)
      `;
      
      await db.promise().query(query, [
        usuario.nombre,
        usuario.email,
        passwordHasheado,
        usuario.rol
      ]);
      
      console.log(`✅ Usuario ${usuario.rol} creado/actualizado: ${usuario.email}`);
    }
    
    console.log("\n🎉 Todos los usuarios han sido creados exitosamente!");
    console.log("\nCredenciales de acceso:");
    console.log("=====================");
    usuarios.forEach(usuario => {
      console.log(`${usuario.rol.toUpperCase()}: ${usuario.email} / ${usuario.password}`);
    });
    
  } catch (error) {
    console.error("❌ Error al crear usuarios:", error);
  } finally {
    db.end();
  }
}

crearUsuarios();
