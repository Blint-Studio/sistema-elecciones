-- Script para actualizar las contraseñas de usuarios seccionales con hashes bcrypt
-- Las contraseñas estaban guardadas en texto plano, ahora se actualizan con hash

-- Seccional 1: LuisJuez2027Seccional1
UPDATE usuarios SET password = '$2b$10$r/iLl6Pw/roK5Pcgwv4zLO/90WdDkKdn3ADSL1OGktFbmvUYpvyIa' WHERE email = 'usuario-seccional-1@cordoba.com';

-- Seccional 2: LuisJuez2027Seccional2
UPDATE usuarios SET password = '$2b$10$IWzok2cyHkksxSRE6eG9i.V91EXEmeicW5nveNWhMVuqkrNsi5QLS' WHERE email = 'usuario-seccional-2@cordoba.com';

-- Seccional 3: LuisJuez2027Seccional3
UPDATE usuarios SET password = '$2b$10$tVLld4MR72a7oVhHIp75ge8xrX.ZkGqIZbgNgveHXU8GmFWCSz3Sa' WHERE email = 'usuario-seccional-3@cordoba.com';

-- Seccional 4: LuisJuez2027Seccional4
UPDATE usuarios SET password = '$2b$10$5bv2qEK/NPOM8LSzd3l7ieuaEF3nHj0TRde4f3CCVpFODVU.l9mnC' WHERE email = 'usuario-seccional-4@cordoba.com';

-- Seccional 5: LuisJuez2027Seccional5
UPDATE usuarios SET password = '$2b$10$tYYMvNKmfyv.ZppmyqnPUeCqL0jnwGdsTqcV5qx1YqhvO99bVEpMe' WHERE email = 'usuario-seccional-5@cordoba.com';

-- Seccional 6: LuisJuez2027Seccional6
UPDATE usuarios SET password = '$2b$10$i47t66Kq7FX7QswuXER25uaW134dP6gyIFy3tBJ1.U1Lt5OZftbKK' WHERE email = 'usuario-seccional-6@cordoba.com';

-- Seccional 7: LuisJuez2027Seccional7
UPDATE usuarios SET password = '$2b$10$F73MxH3sGzfyaylxpzd6UOkrjhMefeCMGWK2dBL7jNonLAgw9hqrq' WHERE email = 'usuario-seccional-7@cordoba.com';

-- Seccional 8: LuisJuez2027Seccional8
UPDATE usuarios SET password = '$2b$10$.L4C1sQ3OVqZu3SycoSDy.niWIX2GsX2ME7w0v5Daw4rulu5F32.a' WHERE email = 'usuario-seccional-8@cordoba.com';

-- Seccional 9: LuisJuez2027Seccional9
UPDATE usuarios SET password = '$2b$10$51LnJUpTxN60iUnMI0UUm.HxhiONFDIjLQlobNxJTlaAb2exMvdV2' WHERE email = 'usuario-seccional-9@cordoba.com';

-- Seccional 10: LuisJuez2027Seccional10
UPDATE usuarios SET password = '$2b$10$RHZhZ5dutaOR5TcOEnUhDu1E5kl46wwjlqn1EPtulG4KQaNN8/AIO' WHERE email = 'usuario-seccional-10@cordoba.com';

-- Seccional 11: LuisJuez2027Seccional11
UPDATE usuarios SET password = '$2b$10$acwgPzDhvp4rNbG0cDp0Ge4s7v7AWpkejMjMmgkzuvd4orIP7r4Am' WHERE email = 'usuario-seccional-11@cordoba.com';

-- Seccional 12: LuisJuez2027Seccional12
UPDATE usuarios SET password = '$2b$10$jhu9VpgSG6uRtM7uJq.m7u4dq1hba1vDIBzPSEtlxsuSDEFsMWKyS' WHERE email = 'usuario-seccional-12@cordoba.com';

-- Seccional 13: LuisJuez2027Seccional13
UPDATE usuarios SET password = '$2b$10$hne3.fj78T/yr9frlFtOuOTvDD8Agbf9QO5jPw6clfoojKpilnlQ2' WHERE email = 'usuario-seccional-13@cordoba.com';

-- Seccional 14: LuisJuez2027Seccional14
UPDATE usuarios SET password = '$2b$10$EvgMTMHoB0t3Go4q.nzp2eIHi9D934l2.LuoL6XENOVS7svlevJqu' WHERE email = 'usuario-seccional-14@cordoba.com';

-- Verificar que las actualizaciones fueron exitosas
SELECT email, nombre, rol, seccional_asignada, SUBSTRING(password, 1, 20) as password_inicio 
FROM usuarios 
WHERE rol = 'seccional' 
ORDER BY seccional_asignada;
