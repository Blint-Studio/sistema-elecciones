# INSTRUCCIONES PARA LOS LOGOS INSTITUCIONALES

## 📁 Ubicación de los Logos
Coloca tus logos PNG en:
- `frontend/public/logo-institucional.png` (logo principal - izquierda)
- `frontend/public/logo-juventud.png` (logo juventud - derecha)

## 🎨 Especificaciones Recomendadas
- **Formato:** PNG (con transparencia si es posible)
- **Tamaño:** 200x200 píxeles mínimo (cuadrado preferible)
- **Resolución:** Alta calidad para pantallas HD
- **Fondo:** Transparente o blanco para mejor integración

## 🔧 Composición Visual
```
[Logo Institucional] --- [Ícono Ciudad] --- [Logo Juventud]
        (70x70px)           (50x50px)         (70x70px)
```

## 🔧 Cómo Cambiar los Logos

### Opción 1: Reemplazar los archivos
1. Elimina los archivos placeholder
2. Coloca tus logos con los nombres exactos:
   - `logo-institucional.png`
   - `logo-juventud.png`
3. Los logos aparecerán automáticamente

### Opción 2: Cambiar los nombres de archivos
Si tus logos tienen otros nombres, edita el archivo `LoginPage.js`:
```javascript
// Para logo institucional (línea ~105):
src="/tu-logo-institucional.png"

// Para logo juventud (línea ~135):
src="/tu-logo-juventud.png"
```

## 🎯 Resultado
- **Logo institucional** aparece a la izquierda
- **Ícono de ciudad** centrado con fondo azul circular
- **Logo juventud** aparece a la derecha
- Efectos hover suaves en todos los elementos
- Adaptación automática a pantallas móviles

## 📱 Responsive
- En pantallas grandes: Los 3 elementos en línea horizontal
- En pantallas pequeñas: Se adaptan automáticamente con flexWrap
- Los logos mantienen proporciones y calidad

## ✨ Efectos Visuales
- **Sombras suaves** en todos los logos
- **Efectos hover** con escala sutil
- **Transiciones suaves** de 0.3 segundos
- **Fondos semitransparentes** para mejor integración
