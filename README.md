# ZBE-Free Maps · Barcelona 🚦

Una PWA para navegar Barcelona evitando las cámaras de la Zona de Bajas Emisiones (ZBE).

## Instalación rápida

```bash
# 0. Configura variables de entorno
copy .env.example .env

# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run dev

# 3. Build para producción (GitHub Pages)
npm run build
```

## Estructura del proyecto

```
/zbe-app
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── App.jsx              # Lógica principal
│   ├── KMLParser.js         # Parser KML + utilidades de distancia
│   ├── MapStyles.js         # Estilo oscuro del mapa
│   ├── index.css            # Estilos globales + Tailwind
│   ├── main.jsx             # Entry point
│   ├── data/
│   │   └── cameras.js       # Datos de cámaras ZBE (130 cámaras)
│   └── components/
│       ├── SearchPanel.jsx  # Barra de búsqueda con Autocomplete
│       ├── ToggleButton.jsx # Toggle Evitar ZBE / Ver cámaras
│       ├── RouteInfo.jsx    # Panel info de ruta
│       └── StatusToast.jsx  # Notificaciones
└── package.json
```

## APIs de Google Cloud necesarias

Habilita estas APIs en tu consola de Google Cloud:
- ✅ **Maps JavaScript API**
- ✅ **Places API**
- ✅ **Directions API**

Configura tu clave en `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=tu_api_key
VITE_CAMERA_TIME_PENALTY_S=180
```

`VITE_CAMERA_TIME_PENALTY_S` define cuántos segundos de penalización se aplican por cada cámara cuando está activo "Evitar Cámaras ZBE".

## Funcionalidades

| Feature | Estado |
|---------|--------|
| Geolocalización GPS | ✅ |
| Búsqueda con Autocomplete | ✅ |
| Visualización de cámaras ZBE | ✅ |
| Cálculo de ruta | ✅ |
| Evitar cámaras ZBE | ✅ (elige la ruta con menos cámaras) |
| Toggle activo/desactivo | ✅ |
| Modo oscuro | ✅ |
| Responsive móvil | ✅ |

## Cómo funciona la lógica de evitación

1. Se solicitan **rutas alternativas** a Google Directions API (`provideRouteAlternatives: true`)
2. Se usa **tráfico en tiempo real** (`duration_in_traffic`) para priorizar la ruta más rápida
3. Cada ruta se decodifica punto a punto (Haversine)
4. Se cuenta cuántas cámaras quedan a menos de **30 metros** de cada ruta
5. El score final es: `tiempo_en_trafico + (camaras * penalizacion)`
6. Las cámaras que quedan en la ruta elegida se pintan en **rojo** (las demás en naranja)

## Deploy en GitHub Pages

```bash
npm run build
# Sube el contenido de /dist a tu repo de GitHub Pages
```

> Nota: Actualiza `base: './'` en `vite.config.js` si usas un subdirectorio.
