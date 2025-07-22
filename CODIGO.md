Esta aplicacion debe ser una especie de dashboard personalizado. Es decir, una aplicacion que almacene toda la informacion más relevante de un partido politico.
La informacion que debe almacenar es:
    1. Instituciones que hay por barrio(Colegios, comisarias, hospitales, centros de salud, centros de ubilados, salas cuna, centros vecinales, entre otros)
    2. Militantes, con sus datos personales(nombre, apellido, edad, numero de telefono, usuario de instagram, si pertenece a "mayores" o "juventud", barrio)
    3. Listado de barrios, categorizados en seccionales(en total hay 14 seccionales -de la seccional 1 a la seccional 14- y cada seccional tiene entre 1 y muchos barrios)
    3. Dentro de los colegios, debemos poder agregar informacion sobre las elecciones:
        a. Cada colegio tiene un numero de mesas, y ese numero de mesas es correlativo (por ejemplo, colegio alto alberdi tiene 5 mesas, de la mesa 10 a la mesa 14, y en cada mesa se puede agregar la cantidad de votos de cada lista politica)
        b. Se debe poder elegir el tipo de eleccion(vecinal, municipal, provincial o nacional) y el año de eleccion
        c. Deben existir, como en la vida real, la categoria de votos EN BLANCO, NULOS, TOTAL DE VOTOS. Total de votos debe ser la sumatoria total de votos de listas, junto a votos en blanco y nulos 
        d. Se debe poder agregar hasta 4 listas electorales(no obligatorio que sean las 4), y si entre las listas no llegan al 100% total de los votos, se agrega la categoria automatica "Otros" con la cantidad de votos del 100%. Ejemplo: Si en el colegio alto alberdi en la mesa 10 hubo 200 electores, y entre las 4 listas solo llegan al 80% total de los votos (160), y entre votos en blanco y nulos son un 10% (20), el 10% restante (20) corresponde a la categoria OTROS
    4. Listado de seccionales, con un paneo general, de cantidad de barrios de cada seccional, cantidad de instituciones y cantidad de militantes
    5. Todo esto debe estar en distintas categorias y en el frontend poder elegirlas en un paner general (posiblemente lateral)
    6. La pantalla principal debe ser un mapa interactivo de la ciudad de cordoba, que permita clickear en un barrio determinado y diga a que seccional pertenece, la cantidad de militantes, cantidad de instituciones (desglosado)
    7. Debe tener todas las medidas de seguridad correspondientes para asegurar confianza y accesibilidad
    8. Debe permitir acceso y responsividad desde cualquier dispositivo
    9. Debe tener sistema e interfaz amigable, intuitiva y facil de utilizar
    10. Debe permitir la efectiva carga de datos por si hay que actualizar listado de militantes, instituciones, entre otros. Del mismo modo se debe permitir modificar y eliminar. Todo esto dependiendo del nivel de acceso del usuario