# LocalDev

Web oficial de LocalDev. HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Estructura

```
index.html          Contenido de la página
privacidad.html     Política de privacidad
css/tokens.css      Colores, tipografías y espaciados
css/base.css        Reset, tipografía y utilidades
css/components.css  Botones, navegación, tarjetas, teléfonos y formulario
css/sections.css    Hero, ventajas, demos, precios, mantenimiento, contacto y pie
assets/demos/       Capturas de las webs modelo
demos/              Copias publicables de Bahía Performance, Corteza y Atlas
js/config.js        Número de WhatsApp
js/main.js          Interacciones
vercel.json         Cabeceras para Vercel
```

## Cambiar el número de WhatsApp

Está en `js/config.js`. El teléfono visible en Contacto y el de los datos estructurados están en `index.html`.

## Publicar en Vercel

1. Sube el contenido de esta carpeta a un repositorio privado de GitHub.
2. En Vercel, importa ese repositorio con **Framework Preset: Other**, sin comando de build.
3. Para actualizar la web, sube los archivos cambiados a GitHub: Vercel publica solo.
