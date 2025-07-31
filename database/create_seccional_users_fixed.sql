-- Script completo para crear usuarios seccionales con contraseñas hasheadas correctamente
-- Primero verificar que la columna seccional_asignada existe

-- Crear usuarios seccionales con contraseñas hasheadas
INSERT INTO usuarios (email, nombre, password, rol, seccional_asignada) VALUES
('usuario-seccional-1@cordoba.com', 'Usuario Seccional 1', '$2b$10$r/iLl6Pw/roK5Pcgwv4zLO/90WdDkKdn3ADSL1OGktFbmvUYpvyIa', 'seccional', 1),
('usuario-seccional-2@cordoba.com', 'Usuario Seccional 2', '$2b$10$IWzok2cyHkksxSRE6eG9i.V91EXEmeicW5nveNWhMVuqkrNsi5QLS', 'seccional', 2),
('usuario-seccional-3@cordoba.com', 'Usuario Seccional 3', '$2b$10$tVLld4MR72a7oVhHIp75ge8xrX.ZkGqIZbgNgveHXU8GmFWCSz3Sa', 'seccional', 3),
('usuario-seccional-4@cordoba.com', 'Usuario Seccional 4', '$2b$10$5bv2qEK/NPOM8LSzd3l7ieuaEF3nHj0TRde4f3CCVpFODVU.l9mnC', 'seccional', 4),
('usuario-seccional-5@cordoba.com', 'Usuario Seccional 5', '$2b$10$tYYMvNKmfyv.ZppmyqnPUeCqL0jnwGdsTqcV5qx1YqhvO99bVEpMe', 'seccional', 5),
('usuario-seccional-6@cordoba.com', 'Usuario Seccional 6', '$2b$10$i47t66Kq7FX7QswuXER25uaW134dP6gyIFy3tBJ1.U1Lt5OZftbKK', 'seccional', 6),
('usuario-seccional-7@cordoba.com', 'Usuario Seccional 7', '$2b$10$F73MxH3sGzfyaylxpzd6UOkrjhMefeCMGWK2dBL7jNonLAgw9hqrq', 'seccional', 7),
('usuario-seccional-8@cordoba.com', 'Usuario Seccional 8', '$2b$10$.L4C1sQ3OVqZu3SycoSDy.niWIX2GsX2ME7w0v5Daw4rulu5F32.a', 'seccional', 8),
('usuario-seccional-9@cordoba.com', 'Usuario Seccional 9', '$2b$10$51LnJUpTxN60iUnMI0UUm.HxhiONFDIjLQlobNxJTlaAb2exMvdV2', 'seccional', 9),
('usuario-seccional-10@cordoba.com', 'Usuario Seccional 10', '$2b$10$RHZhZ5dutaOR5TcOEnUhDu1E5kl46wwjlqn1EPtulG4KQaNN8/AIO', 'seccional', 10),
('usuario-seccional-11@cordoba.com', 'Usuario Seccional 11', '$2b$10$acwgPzDhvp4rNbG0cDp0Ge4s7v7AWpkejMjMmgkzuvd4orIP7r4Am', 'seccional', 11),
('usuario-seccional-12@cordoba.com', 'Usuario Seccional 12', '$2b$10$jhu9VpgSG6uRtM7uJq.m7u4dq1hba1vDIBzPSEtlxsuSDEFsMWKyS', 'seccional', 12),
('usuario-seccional-13@cordoba.com', 'Usuario Seccional 13', '$2b$10$hne3.fj78T/yr9frlFtOuOTvDD8Agbf9QO5jPw6clfoojKpilnlQ2', 'seccional', 13),
('usuario-seccional-14@cordoba.com', 'Usuario Seccional 14', '$2b$10$EvgMTMHoB0t3Go4q.nzp2eIHi9D934l2.LuoL6XENOVS7svlevJqu', 'seccional', 14)
ON DUPLICATE KEY UPDATE 
seccional_asignada = VALUES(seccional_asignada),
rol = VALUES(rol),
password = VALUES(password);

-- Verificar que los usuarios fueron creados/actualizados correctamente
SELECT email, nombre, rol, seccional_asignada, SUBSTRING(password, 1, 20) as password_inicio 
FROM usuarios 
WHERE rol = 'seccional' 
ORDER BY seccional_asignada;

-- INFORMACIÓN DE ACCESO:
-- Email: usuario-seccional-1@cordoba.com   Password: LuisJuez2027Seccional1
-- Email: usuario-seccional-2@cordoba.com   Password: LuisJuez2027Seccional2
-- Email: usuario-seccional-3@cordoba.com   Password: LuisJuez2027Seccional3
-- Email: usuario-seccional-4@cordoba.com   Password: LuisJuez2027Seccional4
-- Email: usuario-seccional-5@cordoba.com   Password: LuisJuez2027Seccional5
-- Email: usuario-seccional-6@cordoba.com   Password: LuisJuez2027Seccional6
-- Email: usuario-seccional-7@cordoba.com   Password: LuisJuez2027Seccional7
-- Email: usuario-seccional-8@cordoba.com   Password: LuisJuez2027Seccional8
-- Email: usuario-seccional-9@cordoba.com   Password: LuisJuez2027Seccional9
-- Email: usuario-seccional-10@cordoba.com  Password: LuisJuez2027Seccional10
-- Email: usuario-seccional-11@cordoba.com  Password: LuisJuez2027Seccional11
-- Email: usuario-seccional-12@cordoba.com  Password: LuisJuez2027Seccional12
-- Email: usuario-seccional-13@cordoba.com  Password: LuisJuez2027Seccional13
-- Email: usuario-seccional-14@cordoba.com  Password: LuisJuez2027Seccional14
