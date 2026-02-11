# Manual de Usuario del Sistema de Gestión "Premezclados Manzanillo"

**Versión del Documento:** 1.0  
**Fecha:** Febrero 2026  

---

## Índice

1.  [Introducción](#1-introducción)
2.  [Requerimientos del Sistema](#2-requerimientos-del-sistema)
3.  [Acceso al Sistema](#3-acceso-al-sistema)
4.  [Interfaz Principal (Dashboard)](#4-interfaz-principal-dashboard)
5.  [Módulos Funcionales](#5-módulos-funcionales)
    *   [5.1 Gestión de Clientes](#51-gestión-de-clientes)
    *   [5.2 Catálogo de Productos](#52-catálogo-de-productos)
    *   [5.3 Gestión de Presupuestos y Ventas](#53-gestión-de-presupuestos-y-ventas)
    *   [5.4 Reportes e Indicadores](#54-reportes-e-indicadores)
6.  [Configuración del Sistema](#6-configuración-del-sistema)
7.  [Solución de Problemas Frecuentes](#7-solución-de-problemas-frecuentes)

---

## 1. Introducción

El presente manual tiene como objetivo guiar a los usuarios en el uso del **Sistema de Gestión Administrativa y Operativa de Premezclados Manzanillo**. Este sistema permite centralizar las operaciones de ventas, facturación, despacho y control de inventario de manera eficiente.

### Alcance
Este documento está dirigido a los siguientes roles:
*   **Administradores:** Configuración global y gestión de usuarios.
*   **Comercial:** Gestión de clientes y creación de presupuestos.
*   **Contable:** Validación de pagos y facturación.
*   **Operaciones:** Control de despachos y logística.

---

## 2. Requerimientos del Sistema

Para garantizar el correcto funcionamiento de la plataforma, asegúrese de contar con:

*   **Dispositivo:** Computadora de escritorio, laptop o tableta.
*   **Sistema Operativo:** Windows 10/11, macOS o Linux.
*   **Navegador Web:** Google Chrome (Recomendado), Mozilla Firefox o Microsoft Edge (Versiones actualizadas).
*   **Conexión a Internet:** Estable, preferiblemente de banda ancha.

---

## 3. Acceso al Sistema

### Ingreso a la Plataforma
1.  Abra su navegador web preferido.
2.  Ingrese la dirección URL del sistema: `http://localhost:3000` (o el dominio asignado en producción).
3.  Se mostrará la pantalla de bienvenida o "Landing Page".

> **Nota para la tesis:** Inserte aquí una captura de la Pantalla de Inicio (Landing Page).
> ![Captura de Pantalla: Landing Page](img/1_landing_page.png)

### Inicio de Sesión
1.  Haga clic en el botón **"Acceder"** o **"Iniciar Sesión"** ubicado en la esquina superior derecha.
2.  Ingrese sus credenciales (Correo electrónico y Contraseña) proporcionadas por el administrador.
3.  Haga clic en **"Entrar"**.

> **Nota para la tesis:** Inserte aquí una captura del formulario de Login.
> ![Captura de Pantalla: Dashboard](img/2_dashboard.png)

---

## 4. Interfaz Principal (Dashboard)

Una vez autenticado, el usuario será redirigido al **Panel de Control (Dashboard)**. Esta pantalla ofrece una visión general del estado de la empresa.

### Elementos Principales
*   **Menú Lateral:** Permite navegar entre los diferentes módulos (Presupuestos, Clientes, Productos, Reportes).
*   **Tarjetas de Resumen:** Muestran indicadores clave como "Ventas del Mes", "Presupuestos Pendientes", "Despachos en Curso".
*   **Gráficos:** Visualización del rendimiento de ventas.

> **Nota para la tesis:** Inserte aquí una captura del Dashboard principal con datos de prueba cargados.
> ![Captura de Pantalla: Dashboard](img/2_dashboard.png)

---

## 5. Módulos Funcionales

### 5.1 Gestión de Clientes
Este módulo permite registrar y actualizar la base de datos de clientes.

**Pasos para registrar un cliente:**
1.  Seleccione **"Clientes"** en el menú lateral.
2.  Haga clic en el botón **"Nuevo Cliente"**.
3.  Complete el formulario con los datos fiscales (Razón Social, RIF/Cédula, Dirección, Teléfono).
4.  Guarde los cambios.

> **Nota para la tesis:** Inserte aquí una captura del listado de clientes o del formulario de registro.
> ![Captura de Pantalla: Módulo de Clientes](img/3_clientes.png)

### 5.2 Catálogo de Productos
Permite administrar los productos y servicios ofrecidos (Concretos, Bloques, Servicios).

**Importante:**
*   Los precios base se definen en **Dólares (USD)**.
*   Cada producto debe pertenecer a una **Categoría** (ej. Estructural).

> **Nota para la tesis:** Inserte aquí una captura del listado de productos.
> ![Captura de Pantalla: Catálogo de Productos](img/4_productos.png)

### 5.3 Gestión de Presupuestos y Ventas
Es el núcleo del sistema. Aquí se generan las cotizaciones para los clientes.

**Flujo de Trabajo:**
1.  **Creación:** El vendedor selecciona al cliente y agrega los productos. El sistema calcula automáticamente el IVA.
2.  **Validación:** El presupuesto se guarda en estado *Pendiente*.
3.  **Aprobación:** Un supervisor (Admin/Contable) revisa y aprueba el presupuesto.
4.  **Pagos:** Se registran los abonos, calculando automáticamente el IGTF si aplica.
5.  **Facturación:** Al completar el pago, se genera el PDF final.

> **Nota para la tesis:** Inserte aquí una captura del formulario de creación de presupuesto.
> ![Captura de Pantalla: Creación de Presupuesto](img/5_presupuestos.png)

> **Nota para la tesis:** Inserte aquí una captura de un Presupuesto/Factura en PDF generado por el sistema.
> ![Captura de Pantalla: PDF Generado](img/5_presupuestos.png)

### 5.4 Reportes e Indicadores
Permite visualizar la data histórica para la toma de decisiones.
*   **Top de Ventas:** Productos más vendidos.
*   **Reporte de Cobranza:** Estado de las cuentas por cobrar.

> **Nota para la tesis:** Inserte aquí una captura de la sección de Reportes.
> ![Captura de Pantalla: Reportes](img/6_reportes.png)

---

## 6. Configuración del Sistema
*(Exclusivo para Administradores)*

En esta sección se definen los parámetros globales de la empresa que aparecerán en los documentos legales.

*   **Identidad Corporativa:** Nombre, RIF, Logo.
*   **Impuestos:** Configuración de la tasa del IVA y del IGTF.
*   **Usuarios:** Gestión de roles y accesos.

> **Nota para la tesis:** Inserte aquí una captura de la pantalla de Configuración.
> ![Captura de Pantalla: Configuración](img/7_configuracion.png)

---

## 7. Solución de Problemas Frecuentes

| Problema | Causa Probable | Solución |
| :--- | :--- | :--- |
| **No puedo generar un PDF** | Faltan datos de la empresa. | Vaya a Configuración > Identidad Corporativa y complete los campos. |
| **El botón de pago está bloqueado** | El presupuesto venció. | Solicite a un administrador extender la fecha de validez. |
| **Error al iniciar sesión** | Credenciales inválidas. | Verifique su correo o contacte soporte para restablecer contraseña. |

---
**Fin del Manual de Usuario**
