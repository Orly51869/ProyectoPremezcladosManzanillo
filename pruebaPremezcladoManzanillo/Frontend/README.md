<p align="center">
  <img src="public/assets/LOGO_PREMEZCLADOS.svg" alt="Logo Premezclado Manzanillo" width="200">
</p>

# Premezclado Manzanillo - Frontend

Este proyecto es la interfaz de usuario para la aplicación web de Premezclado Manzanillo, una compañía de venta de concreto premezclado en el Estado Nueva Esparta, Venezuela.

---

## 📋 Tabla de Contenidos

1.  [✨ Características](#-características)
2.  [🛠️ Stack Tecnológico](#️-stack-tecnológico)
3.  [🚀 Guía de Inicio Rápido](#-guía-de-inicio-rápido)
    *   [Requisitos Previos](#requisitos-previos)
    *   [Instalación](#instalación)
    *   [Scripts Disponibles](#scripts-disponibles)
4.  [📁 Estructura del Proyecto](#-estructura-del-proyecto)
5.  [🤔 Solución de Problemas](#-solución-de-problemas)
6.  [📄 Licencia](#-licencia)

---

## ✨ Características

*   **Interfaz Moderna:** Construida con React y estilizada con Tailwind CSS.
*   **Página de Inicio Dinámica:** Incluye un carrusel, secciones de productos, servicios y contacto.
*   **Navegación Completa:** Navbar fijo con modo oscuro/claro y enlaces funcionales.
*   **Catálogo de Productos:**
    *   Vista de catálogo completo con todos los productos.
    *   Páginas dedicadas para cada categoría de producto.
*   **Panel de Control (Dashboard):** Estructura preparada para la gestión de clientes, presupuestos y pagos.
*   **Widget de Chat:** Componente flotante para futura integración con un asistente de IA.

---

## 🛠️ Stack Tecnológico

*   **Framework Principal:** [React](https://reactjs.org/)
*   **Enrutamiento:** [React Router DOM](https://reactrouter.com/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
*   **Iconos:** [Lucide React](https://lucide.dev/)
*   **Gráficos (Dashboard):** [Chart.js](https://www.chartjs.org/) con [react-chartjs-2](https://react-chartjs-2.js.org/)
*   **Utilidades de Fechas:** [date-fns](https://date-fns.org/)

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu entorno de desarrollo:

*   [Node.js](https://nodejs.org/) (v16 o superior recomendado)
*   [npm](https://www.npmjs.com/) (v8 o superior)

### Instalación

1.  Clona o descarga el proyecto en una ruta local (ej. `C:\Proyectos\Web\React\pruebaPremezcladoManzanillo`).
    *   **Nota:** Se recomienda no usar rutas sincronizadas con OneDrive para evitar posibles conflictos.

2.  Abre una terminal en la carpeta `Frontend` y ejecuta el siguiente comando para instalar todas las dependencias:

    ```bash
    npm install
    ```

### Scripts Disponibles

En el directorio del proyecto, puedes ejecutar los siguientes comandos:

| Comando         | Descripción                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| `npm start`     | Inicia la aplicación en modo de desarrollo. Abre [http://localhost:3000](http://localhost:3000). |
| `npm test`      | Ejecuta las pruebas en modo interactivo.                                     |
| `npm run build` | Compila la aplicación para producción en la carpeta `build`.                 |
| `npm run eject` | **Acción permanente.** Expulsa la configuración de Create React App.         |

---

## 📁 Estructura del Proyecto

Una descripción general de la organización de la carpeta `src`:

```
/src
├── /components       # Componentes reutilizables en toda la aplicación (Navbar, Footer, etc.)
├── /layouts          # Estructuras de página base (ej. DashboardLayout)
├── /mock             # Datos de prueba o simulados (ej. data.js)
├── /pages            # Componentes que representan una página completa (HomePage, Dashboard, etc.)
├── /sections         # Componentes grandes que forman una sección de una página (HeroSection, ProductsSection)
├── /utils            # Funciones de ayuda y utilidades generales
├── App.js            # Componente raíz y configuración de rutas
├── index.js          # Punto de entrada principal de la aplicación
└── styles.css        # Estilos globales y directivas de Tailwind
```

---

## 🤔 Solución de Problemas

*   **Error: "Module not found"**:
    Asegúrate de que la dependencia esté listada en `package.json` y ejecuta `npm install`. Si falta, instálala con `npm install <nombre-del-paquete>`.

*   **Error: "Identifier 'X' has already been declared"**:
    Esto suele ocurrir por una colisión de nombres. Puedes renombrar la importación usando un alias: `import { Settings as SettingsIcon } from 'lucide-react'`.

*   **Vulnerabilidades de `npm audit`**:
    Ejecuta `npm audit fix` para intentar solucionar las vulnerabilidades de forma automática. Evita usar `--force` a menos que sea estrictamente necesario.

---

## 📄 Licencia

Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo `LICENSE` en la raíz del proyecto para más detalles.