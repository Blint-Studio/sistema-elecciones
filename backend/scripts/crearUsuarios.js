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
  }
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
