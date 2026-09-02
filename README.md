# Jardín de Recuerdos · Event Photo Journal

Web app de captura colaborativa de fotos para eventos con estética de cámara desechable
vintage: grano de película, bordes de papel rasgado, marcos polaroid apilados y
paleta de tonos cálidos y apagados (rosa viejo, verde oliva, beige, marrón oscuro).

Sin build step: HTML, CSS y JavaScript puro. Sirve la carpeta con cualquier servidor
estático (HTTPS o `localhost` para que el navegador permita el acceso a la cámara).

```bash
npx serve .          # o: python3 -m http.server 8080
```

## Pantallas

| Pantalla | Qué hace |
| --- | --- |
| **Bienvenida** | Fondo de alstroemeria, etiqueta `FR.1983`, dibujo de una línea de dos flores, mensaje de bienvenida personalizable, campo de nombre y marca de agua `fond`. |
| **Tablero** | Título del evento, contadores *Moments / Time Left / People* (People abre la lista de contribuidores), botón píldora de cámara, botones cuadrados de galería y descarga, cuadrícula de polaroids con nombre del autor. |
| **Cámara** | Visor 4:5 con grano animado, bordes rasgados, viñeta y preset *Vintage Film* en vivo. Controles de flash (torch o flash de pantalla), zoom 0.5 / 1x / 2x (hardware si el dispositivo lo soporta, si no recorte), cambio de cámara y disparador de metal texturizado. Si no hay cámara, permite importar una imagen. |
| **Estilo** | *Choose your photo style*: previsualización en polaroid apilada, swatches Original / Vintage / Black & White con descripciones, **Hold to compare** (vista dividida original vs. estilo) y botón *Next*. El preset por defecto es Vintage. |

## Procesado de imagen (`js/filters.js`)

Todo se hace con Canvas 2D, sin dependencias:

- **Vintage**: ligera desaturación, cast dorado (más rojo/verde, menos azul), curva con negros
  levantados (fade), light leak cálido en una esquina, viñeta y grano triangular.
- **Black & White**: mezcla ortocromática, curva con fade, tinte cálido casi imperceptible, viñeta y grano fuerte.
- **Original**: sólo grano fino y viñeta mínima.

## Datos (`js/db.js`)

- `localStorage` → `jdr:config` (título, mensaje de bienvenida, etiqueta de origen, fecha de fin) y `jdr:user` (nombre).
- `IndexedDB` (`jardin-de-recuerdos` / store `photos`) → cada foto como Blob JPEG con
  `{ id, blob, author, style, createdAt, width, height, demo }`.

El almacenamiento es local al dispositivo; para compartir en tiempo real entre invitados
basta con sustituir `JDR.db.photos` por un backend (p. ej. Supabase Storage + tabla `photos`)
manteniendo la misma interfaz `all / add / remove`.

## Personalización

El icono de lápiz (bienvenida) o el engranaje (tablero) abren una hoja para editar el título
del evento, el mensaje de bienvenida, la etiqueta de origen y la fecha de fin (cuenta atrás).
Al primer arranque se siembran seis fotos de demostración generadas por código; se retiran
desde la misma hoja con *Retirer les photos démo*.

## Descarga del álbum

El botón de descarga del tablero empaqueta todas las fotos en un `.zip` con un `index.json`
de atribuciones (JSZip desde CDN). Sin red, descarga las fotos una a una.

## Tipografía

- Serif refinada: *Cormorant Garamond* (títulos, encabezados, etiquetas).
- Serif rústica: *IM Fell English* (marca de agua `fond`, avatares).
- Máquina de escribir: *Special Elite* (contadores, nombres, sellos).
