# Clock — Armador Inteligente de Horarios Académicos

## Descripción

**Clock** es una aplicación web de página única que permite a un estudiante
armar su horario académico a partir de un catálogo de materias y secciones
provisto por el profesor. La aplicación se ejecuta íntegramente en el navegador,
sin servidor y sin persistencia de datos: todo el estado vive en memoria durante
la sesión.

El usuario selecciona las materias que desea cursar y Clock detecta los choques
de horario, genera todas las combinaciones válidas de secciones y las presenta
en una rejilla semanal construida con CSS Grid. Las combinaciones pueden
filtrarse según preferencias (días libres, hora mínima de entrada, hora máxima
de salida) y ordenarse por criterios de conveniencia (menos días de asistencia,
menos horas muertas, salida más temprana). El flujo termina con la elección de
un horario definitivo y una vista de resumen imprimible.

Además del catálogo provisto, la aplicación permite registrar materias manuales
durante la sesión mediante un formulario validado, que se comportan igual que
las del catálogo pero se pierden al recargar la página.

---

## Integrantes y división del trabajo

### Daniel Quintero
**Rol:** núcleo lógico, validaciones, maquetación base y estilos.

| Archivo / módulo | Responsabilidad |
|---|---|
| `index.html` | Estructura semántica completa de la aplicación y carga ordenada de scripts |
| `js/tiempo.js` | Conversión de horas `HH:MM` a minutos y detección de superposición |
| `js/datos.js` | Gestor unificado de bloques y materias (catálogo + manuales) |
| `js/choques.js` | Detección de choques entre sesiones, secciones y materias incompatibles |
| `js/formulario.js` | Registro, edición, eliminación y validación de materias manuales |
| `js/rejilla.js` | Rejilla semanal con CSS Grid calculada por horas, color por materia, tooltip y horas muertas visuales |
| `css/styles.css` | Identidad visual minimalista: tokens, componentes, rejilla, modales, responsive y micro-interacciones |

**Commits principales:** `chore: Primer commit`, `tiempo.js:`, `datos.js:`, `choques.js`, `formulario.js:`, `rejilla.js:`, `styles.css:`, `index.html:`.

---

### Jean Villasmil
**Rol:** motor de generación, filtros, resumen, catálogo, selección y coordinación general.

| Archivo / módulo | Responsabilidad |
|---|---|
| `js/generador.js` | Generación de combinaciones válidas con backtracking y descarte temprano |
| `js/preferencias.js` | Filtros de días/horas y ordenamiento de resultados por criterios de conveniencia |
| `js/resumen.js` | Renderizado del horario definitivo con tabla por materia y total de UC |
| `css/print.css` | Estilos específicos de impresión de la vista de resumen |
| `js/catalogo.js` | Listado del catálogo, filtros de búsqueda y modal de detalle de materias |
| `js/seleccion.js` | Estado global de selección: tope UC, fijar/excluir secciones y atajo de trimestre completo |
| `js/app.js` | Punto de entrada y coordinación general del flujo |
| `README.md` | Documentación del proyecto |

**Commits principales:** `generador.js:`, `preferencias.js:`, `resumen.js:`, `print.css:`, `catalogo.js:`, `seleccion.js:`, `app.js:`, `docs: README`.

---

### Coordinación conjunta

- Definición de la arquitectura general, estructura de archivos y formato de los
  datos compartidos entre módulos.
- Integración final de todos los módulos y pruebas cruzadas de extremo a extremo.
- Revisión mutua del código del otro integrante.

---

## Instrucciones para ejecutar el proyecto

El proyecto **no requiere servidor ni instalación de dependencias**. Todo el
código es JavaScript puro (Vanilla) y CSS propio.

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/DanielAlej12/Proyecto-1-Clientes-Web.git
   cd Proyecto-1-Clientes-Web

2. Abrir index.html en el navegador:
   - Opción A: doble clic sobre index.html en el explorador de archivos.
   - Opción B: arrastrar index.html a una pestaña del navegador.
   - Opción C: usar una extensión como Live Server de VS Code
    o abrir con:
   ```bash
   # En Linux/macOS
   open index.html
   # En Windows
   start index.html

3. La aplicación se carga en el navegador y queda lista para usarse.
   - Navegador moderno (Chrome, Firefox, Edge o Safari en versiones recientes).
   - No requiere conexión a internet después de clonar el repositorio.m

---

## Estructura del proyecto

```
/clock-horarios
├── index.html
├── README.md
├── /css
│   ├── styles.css
│   └── print.css
├── /data
│   ├── bloques.js       → provisto por el profesor (no modificar)
│   └── materias.js      → provisto por el profesor (no modificar)
└── /js
    ├── tiempo.js        → conversión y comparación de horas
    ├── datos.js         → acceso a bloques y materias
    ├── seleccion.js     → estado de selección y restricciones
    ├── choques.js       → detección de choques e incompatibilidades
    ├── generador.js     → generación de combinaciones válidas
    ├── preferencias.js  → filtros y ordenamiento
    ├── formulario.js    → materias manuales
    ├── catalogo.js      → catálogo, filtros y detalle
    ├── rejilla.js       → rejilla semanal con CSS Grid
    ├── resumen.js       → horario definitivo e impresión
    └── app.js           → punto de entrada y coordinación
```

---

## Funcionalidades principales

### Catálogo de materias
  - Listado completo con código, nombre, trimestre, UC y cantidad de secciones.
  - Filtro por trimestre y búsqueda por nombre o código en tiempo real.
  - Vista de detalle con profesor, días, horas legibles y aula de cada sección.
  - Distinción visual entre materias del catálogo y materias manuales.

### Selección de materias
  - Agregar y quitar materias desde el catálogo.
  - Atajo "Agregar trimestre completo" (incluye materias manuales del trimestre).
  - Contador visible de cantidad de materias y total de UC.
  - Tope de UC configurable (por defecto 28), con validación e información del
  exceso al intentar superarlo.
  - Fijar una sección específica para que solo se consideren combinaciones que la
  contengan.
  - Excluir secciones concretas, impidiendo excluir la totalidad de una materia.

### Materias manuales
  - Formulario con validación completa: campos requeridos, código único respecto
  al catálogo y a otras manuales, UC entre 1 y 5, identificador de sección
  único, bloques del mismo tipo y consecutivos, y sin choques entre sesiones de
  una misma sección.
  - Edición y eliminación de materias manuales con modal de confirmación propio.
  - Las materias manuales se pierden al recargar la página (sin persistencia).

### Detección de choques
  - Comparación por horas reales, no por identificadores de bloque.
  - Una sesión que termina exactamente cuando empieza otra no se considera choque.
  - Detección de materias incompatibles (pares en los que todas las secciones
  disponibles de una chocan con todas las de la otra), informadas visualmente
  con badge y borde rojo en el catálogo y en la selección.

### Generación de horarios
  - Botón "Generar horarios" que produce todas las combinaciones válidas de la
  selección actual mediante backtracking con descarte temprano.
  - Muestra el número total de combinaciones encontradas.
  - Si no existe ninguna combinación válida, informa junto con las materias
  incompatibles detectadas.
  - Cualquier cambio en la selección invalida los resultados hasta que se vuelva
  a generar.

### Filtros y ordenamiento
  - Filtros combinables de días libres, hora mínima de entrada y hora máxima de
  salida.
  - Ordenamiento por tres criterios: menos días de asistencia, menos horas muertas
  y salida más temprana.

### Rejilla semanal
  - Construida con CSS Grid, sin `<table>`.
  - Columna por día (lunes a sábado) y escala vertical calculada a partir de los
  bloques del catálogo.
  - Cada sesión ocupa exactamente su duración, incluidas las de laboratorio.
  - Color estable por materia en todos los resultados.
  - Navegación anterior/siguiente con indicador de posición.
  - Métricas del resultado: días de asistencia, horas muertas, hora de entrada
  más temprana y hora de salida más tardía.
  - Horas muertas resaltadas visualmente con franjas diagonales.
  - Tooltip con detalle completo al pasar el mouse sobre una sesión.
  - Modal de detalle al hacer clic (nombre, profesor, día, horas y aula).

### Horario definitivo y resumen
  - Elección de un resultado como horario definitivo.
  - Rejilla + tabla por materia con código, nombre, sección, profesor, horario,
  aula y total de UC.
  - Versión imprimible que oculta todos los controles de la interfaz.

---

## Criterios de ordenamiento y métricas

### Menos días de asistencia
Cuenta los días distintos en los que hay al menos una sesión. Menos días = mejor
posición en el orden.

### Menos horas muertas
Suma, por cada día, el tiempo entre el fin de una sesión y el inicio de la
siguiente (solo si hay un hueco real). Se expresa en minutos. Menos minutos
muertos = mejor posición.

### Salida más temprana
Calcula, por cada día con clases, la hora de salida más tardía, y luego promedia
esas salidas entre los días con clases. Menor promedio = mejor posición.

### Métricas mostradas junto a la rejilla
  - Días de asistencia: cantidad de días distintos con al menos una sesión.
  - Horas muertas: suma de minutos entre sesiones consecutivas del mismo día.
  - Hora de entrada más temprana: el inicio más temprano entre todas las
  sesiones del horario.
  - Hora de salida más tardía: el fin más tardío entre todas las sesiones del
  horario.

---

## Decisiones de diseño

### Identidad de la aplicación
El nombre Clock se eligió por su asociación directa con el tiempo y la
organización horaria, manteniendo una sola palabra corta, memorable y fácil de
recordar. El logotipo textual usa el emoji de calendario (📅) como guiño visual
al propósito de la app.

### Paleta de colores
La identidad visual se apoya en una paleta minimalista y sobria con un
azul protagonista y un acento salvia para estados de éxito:

| Rol | Color | Uso |
| --- | --- | --- |
| Fondo | `#fafaf7` (marfil) | Fondo general de la app |
| Superficie | `#ffffff` | Tarjetas y paneles |
| Tinta | `#1a1a1a` | Texto principal |
| Azul profundo | `#1e3a5f` | Botones primarios, cabeceras de la rejilla, títulos |
| Azul medio | `#2c5f8a` | Hover, focos, bordes activos, códigos |
| Azul suave | `#e3edf6` | Fondos de selección, estados fijados |
| Salvia | `#5b8c7e` | Estados de éxito y botón de horario definitivo |
| Terracota| `#e8a87c` | Materias manuales y horas muertas |
| Rojo | `#b8473a` | Errores e incompatibilidades |

El azul transmite confianza y orden, adecuado para una herramienta académica; la
salvia y la terracota aportan calidez sin romper la sobriedad del conjunto.

### Tipografía
Se usa la pila de fuentes del sistema (`Inter`, `system-ui`, `-apple-system`,
`Segoe UI`, `Roboto`) para garantizar legibilidad y rapidez de carga sin
dependencias externas. Para códigos, horas y métricas numéricas se usa una
tipografía monoespaciada (`JetBrains Mono`, `ui-monospace`, `SF Mono`) con
`font-variant-numeric: tabular-nums` para que las cifras se alineen
verticalmente.

### Iconografía
No se usan librerías de iconos externas. La iconografía es **mínima y
funcional**, basada en:
- **Emojis nativos** para el logotipo (📅).
- **Flechas SVG inline** para los `<select>` (flecha desplegable) y los botones
de navegación (◀ ▶).
- **Formas CSS** para los checkboxes personalizados (marca dibujada con
pseudo-elementos).
- **Indicadores de color** (puntos, bordes, badges) para comunicar estados como
"seleccionada", "fijada", "excluida" o "incompatible".

### Componentes con estilo propio
Todos los controles (botones, campos de texto, selects, checkboxes, tarjetas,
modales, badges, mensajes del sistema) tienen un estilo definido por la pareja,
**sin apariencia nativa del navegador**. Los `<select>` reemplazan la flecha del
sistema por una flecha SVG propia; los checkboxes son personalizados con
`appearance: none`; los botones tienen estados `hover`, `focus-visible` y
`active` visibles.

### Micro-interacciones y estados
- Animación `fadeInGrid` al cambiar de resultado en la rejilla.
- Apertura y cierre animados de los modales.
- Animación `pulse` al fijar o excluir una sección.
- Spinner animado durante la generación de horarios.
- Mensajes del sistema con animación `slideDown` y auto-ocultar a los 6 s.
- Franjas diagonales para visualizar horas muertas.
- Tooltip nativo con detalle completo al pasar el mouse por una sesión.

### Referencias de inspiración
- **Notion** y **Linear**: minimalismo, tipografía clara, uso de espacios en
blanco y paletas sobrias con un solo color de acento.
- **Google Calendar** y **Cron**: layout de rejilla semanal por horas, uso de
colores por categoría y navegación horizontal entre opciones.
- **Stripe Dashboard**: uso de tarjetas con bordes suaves, sombras mínimas y
jerarquía tipográfica por tamaño y peso.

---

## Capturas de pantalla

### Catálogo de materias
![Catalogo de Materias](https://private-user-images.githubusercontent.com/222311052/681926167-6e8c9be6-47b7-4d18-a980-3d02f3429860.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTcwMzUsIm5iZiI6MTc5MjY5NjczNSwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTI2MTY3LTZlOGM5YmU2LTQ3YjctNGQxOC1hOTgwLTNkMDJmMzQyOTg2MC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTE4NTVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT01NmQ1Mjc0OWEzZjI1MGRiODUxMDVlNzEwNTkwYTRlZWE5MmY3NmRiYjUwYTA1MjdhOWQ3Yzg1MTBjN2MxZjExJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.5t1X71Z5zEFSU8TWZnTf4AyOzhJ13suhKSvgbZWycp4)

### Selección con restricciones y mini-mapa de choques
![Selección1](https://private-user-images.githubusercontent.com/222311052/681926577-4b97b634-3fa4-4240-92d9-d0604fd8cde4.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTcwMzUsIm5iZiI6MTc5MjY5NjczNSwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTI2NTc3LTRiOTdiNjM0LTNmYTQtNDI0MC05MmQ5LWQwNjA0ZmQ4Y2RlNC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTE4NTVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT05MzQ3NWE5YzM1YTNjOWI1MTE5NDBmMmU0MmE4MDcyMWQ3ZGE4YjM3NjZjYzNjYWI0MzFhNjhmMmI3ODA1ZWViJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.XKBH9TEJ4S5lq9iD8QW6YpuLUIYh-3lZqsOWlm28zn0)
![Selección2](https://private-user-images.githubusercontent.com/222311052/681926696-2a84d3dc-8354-402c-b4f9-4088d0c84df7.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTcwMzUsIm5iZiI6MTc5MjY5NjczNSwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTI2Njk2LTJhODRkM2RjLTgzNTQtNDAyYy1iNGY5LTQwODhkMGM4NGRmNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTE4NTVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1lNDI4NzA1MGM2MTRiZGEzM2IzZjY3ODIyYTAwN2ZmZTAwN2U2Y2VjOGI0MDExYjU0MTdiZTU2ZGJkNDJmYzE0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.tBKywRnoo42vpNl8ByneJCYxCSwTyfuJIds0h0EkCCM)

### Formulario de materias manuales
![Formulario manual1](https://private-user-images.githubusercontent.com/222311052/681926696-2a84d3dc-8354-402c-b4f9-4088d0c84df7.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTcwMzUsIm5iZiI6MTc5MjY5NjczNSwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTI2Njk2LTJhODRkM2RjLTgzNTQtNDAyYy1iNGY5LTQwODhkMGM4NGRmNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTE4NTVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1lNDI4NzA1MGM2MTRiZGEzM2IzZjY3ODIyYTAwN2ZmZTAwN2U2Y2VjOGI0MDExYjU0MTdiZTU2ZGJkNDJmYzE0JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.tBKywRnoo42vpNl8ByneJCYxCSwTyfuJIds0h0EkCCM)
![Formulario manual2](https://private-user-images.githubusercontent.com/222311052/681927278-3e9ecb75-d841-4c28-b7d0-887d7f98fce0.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTcyOTksIm5iZiI6MTc5MjY5Njk5OSwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTI3Mjc4LTNlOWVjYjc1LWQ4NDEtNGMyOC1iN2QwLTg4N2Q3Zjk4ZmNlMC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTIzMTlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wMjA1OGMzYzZjNjI1ZDI4YmEwN2MzYzY3ZmIwMWMxZTFiYTZjZDI4YTQ0MmFlY2YwNGY4NjYxZWJmZDY4NWRiJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.lX2sfGLo3VnfenXic5n9uySAy5NlWLcdsXkcQ1nIXRU)

### Filtros de Preferencias
![Filtros](https://private-user-images.githubusercontent.com/222311052/681929010-fd7a546d-46c5-4dc3-b0b2-0159b6436512.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTcyOTksIm5iZiI6MTc5MjY5Njk5OSwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTI5MDEwLWZkN2E1NDZkLTQ2YzUtNGRjMy1iMGIyLTAxNTliNjQzNjUxMi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTIzMTlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1mMTFjZTM5ZGVhMzdhZjA0MjE2NDc1NjJjMTYwOTVlMTAwM2U2NGFhNjY4MzkzMTgxOWNkODM4ODk1ZWE0ZGQ2JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.Cf84ryA5T3HZQTrWNsEWLFiPUQ_4MklG0UAa8UOh1Jc)

### Rejilla semanal con métricas
![Rejilla semanal](https://private-user-images.githubusercontent.com/222311052/681929232-15f78720-a647-4d16-aafe-ebdb164dbcd3.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTc1NTIsIm5iZiI6MTc5MjY5NzI1MiwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTI5MjMyLTE1Zjc4NzIwLWE2NDctNGQxNi1hYWZlLWViZGIxNjRkYmNkMy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTI3MzJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT02OWNhMzNlZjVmZTEwNzU0MjUxOGM0MGUzM2UxOTZlZWIzYzc4OTE3YTcxNzQwYmU4OWYyYjcxNWUwMzM2MDkwJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.Yjir0FnwOYRYIjEn8txH505YQGY2X1_i0Abn8iIXOBg)

### Vista de resumen del horario definitivo
![Resumen](https://private-user-images.githubusercontent.com/222311052/681930730-e6271a71-e8e5-41b8-84df-cbd764e5523f.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTc1NTIsIm5iZiI6MTc5MjY5NzI1MiwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTMwNzMwLWU2MjcxYTcxLWU4ZTUtNDFiOC04NGRmLWNiZDc2NGU1NTIzZi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTI3MzJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00ZDQ4MTc2MWRmMjc4ZWVhNTVlNDYzZTlkZDAzYjBhOWIxZGRkY2Q4ODcyMWY4N2U1NDkwNDQzNWU5Y2Q5ZWQ1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.m8WxK8H-7EGFrpBgOMDZLwNckXr43UYCD7rPMolkank)

### Vista imprimible
![Print1](https://private-user-images.githubusercontent.com/222311052/681930909-4f5c4909-4d97-44b1-a7ab-9089a9d7d799.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTc1NTIsIm5iZiI6MTc5MjY5NzI1MiwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTMwOTA5LTRmNWM0OTA5LTRkOTctNDRiMS1hN2FiLTkwODlhOWQ3ZDc5OS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTI3MzJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wNmFjZTQ3ZmQyMDE5NTRlMmFlZTU5ODBlZWY5YWRjZDFkNjBmYzZhMzgxMmFlMjgwZWQ0OWY4YWVjNWI3YzQ3JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.jfia6vv9FSj4RZIho3OrsUBv68vNovbE5TpDSDvmSvg)

![Print2](https://private-user-images.githubusercontent.com/222311052/681931088-0cbc79f3-c423-4acf-ba59-27f14854093c.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3OTI2OTc1NTIsIm5iZiI6MTc5MjY5NzI1MiwicGF0aCI6Ii8yMjIzMTEwNTIvNjgxOTMxMDg4LTBjYmM3OWYzLWM0MjMtNGFjZi1iYTU5LTI3ZjE0ODU0MDkzYy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYxMDIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MTAyMlQxOTI3MzJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0wNDUyM2EyOTc5YWQ3Y2NlOWE3YWE3OTgyMTBkYWJkMjg5NDI1Yzk0NzZjMjFjZmVmZjUzY2NmZjQ1MDRiZjdlJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCZyZXNwb25zZS1jb250ZW50LXR5cGU9aW1hZ2UlMkZwbmcifQ.QWVR-ClKRQVMO1MpriK0y5XCBBpjVHDVBSg6ZigFPVY)