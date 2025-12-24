<p align="center">
  <img src="../Frontend/public/assets/LOGO_PREMEZCLADOS.svg" alt="Logo Premezclado Manzanillo" width="200">
</p>

# 📘 Guía de Usuario - Premezclado Manzanillo

Esta guía proporciona una explicación exhaustiva de todas las herramientas disponibles en la plataforma de Premezclado Manzanillo. Está diseñada para guiar tanto a nuevos administradores en la configuración inicial como al personal operativo en el día a día.

---

## 🗺️ Mapa de Ruta Operativo (Flujo de Trabajo)
El siguiente diagrama resume el ciclo de vida de una venta dentro de la plataforma, desde la captación del cliente hasta el análisis gerencial:

<p align="center">
  <img src="./Decision Path Option-2025-12-24-002826.png" alt="Decision Path Diagram" width="500">
</p>

---

## 🚀 1. Guía de Puesta en Marcha (Orden Lógico)
Si la base de datos está vacía (por ejemplo, después de una migración o instalación inicial), siga este orden exacto para asegurar que la información fluya correctamente:

### Paso 1: Identidad Corporativa y Configuración Global
Antes de emitir cualquier documento, debe definir quién emite.
1.  Vaya a la sección **"Configuración"** en el menú lateral.
2.  En el panel **"Identidad Corporativa"**, configure:
    *   **Nombre de la Empresa, RIF, Teléfono y Dirección Física:** Datos obligatorios para el encabezado de los presupuestos.
    *   **Tasa de IVA (%):** El porcentaje de impuesto general (ej: 16).
    *   **Tasa de IGTF (%):** El impuesto aplicable a pagos en divisas (ej: 3).
    *   **Logo de la Empresa:** Use el botón "Seleccionar archivo" para subir su logo. El sistema generará automáticamente la vista previa y la ruta para los PDFs.
3.  Haga clic en **"Guardar Cambios Corporativos"**.
4.  Vaya a **"Personalizar"** si desea configurar el **Carrusel (Hero)** o servicios visuales de la web.

### Paso 2: Estructura del Catálogo (Productos y Precios)
No se pueden crear presupuestos sin productos definidos. Puede hacerlo de dos formas:

1.  **Carga Manual:**
    *   Vaya a **"Productos"** para gestionar el inventario maestro.
    *   Defina **Categorías** (ej: Aditivos, Especiales, Pavimentos).
    *   Agregue productos especificando su **Precio Base** y su **Tipología** (Concreto, Bloque, Servicio u Otro).
    *   *Sugerencia:* Incluya la unidad de medida (m3, saco, viaje) en el nombre o descripción para mayor claridad en el presupuesto.

2.  **Carga Masiva (Recomendado para inventarios grandes):**
    *   Vaya a **"Configuración"** -> **"Importar Datos"**.
    *   **Preparación del archivo CSV:** El archivo debe guardarse con codificación UTF-8 y usar comas como separadores.
    *   **Estructura Técnica del CSV:**
        | Columna | Descripción | Ejemplo |
        | :--- | :--- | :--- |
        | `nombre` | Nombre descriptivo del producto. | Concreto 3500 PSI |
        | `precio` | Valor numérico sin símbolos de moneda. | 145.50 |
        | `tipo` | Clasificación (CONCRETO, BLOQUE, SERVICIO, OTRO). | CONCRETO |
        | `categoria` | Nombre del grupo de productos. | Estructurales |
        | `descripcion`| (Opcional) Detalles técnicos adicionales. | Mezcla con aditivo |
    *   **Lógica de Importación:**
        *   Si la **Categoría** no existe, el sistema la creará automáticamente.
        *   Los precios se asumen siempre en **Dólares (USD)**.
        *   Si un producto ya existe con el mismo nombre, el sistema intentará actualizarlo o dará error dependiendo de la integridad de los datos.
        *   **Consejo:** Descargue la plantilla de ejemplo desde el panel de configuración (si está disponible) antes de subir sus datos reales.

### Paso 3: Registro de Clientes
1.  Vaya a la sección **"Clientes"**.
2.  Registre a sus clientes recurrentes o nuevos.
    *   Es obligatorio el **RIF o Cédula** para la validez legal del presupuesto.
    *   Asegúrese de escribir correctamente el correo para futuras notificaciones.

### Paso 4: Ciclo de Venta (Presupuestos y Pagos)
Una vez configurado lo anterior, el sistema está listo para operar:
1.  **Crear Presupuesto:** El asesor comercial selecciona al cliente y los productos. El sistema calcula automáticamente el IVA y el IGTF proyectado.
2.  **Aprobación Gerencial:** Un presupuesto en estado "PENDING" no permite pagos. Debe ser revisado por un Administrador o Contable quien, tras verificar la viabilidad, cambia el estado a "APPROVED".
3.  **Gestión de Vigencia:** Los presupuestos tienen una fecha de vencimiento. Si esta fecha pasa, el botón de pago se desactiva. La gerencia puede extender la vigencia desde el panel de detalle.
4.  **Registro de Pago:** Una vez aprobado, el cliente puede abonar. Se admiten múltiples pagos hasta completar el `Total`.
5.  **Facturación y Proforma:** Al completar el pago (o según política interna de crédito), se genera el documento final con sello de "PAGADO" o "CRÉDITO".
6.  **Despacho y Ejecución:** Operaciones recibe la orden, prepara la mezcla basándose en los parámetros técnicos definidos y, tras la entrega en obra, carga la fotografía de la guía firmada para cerrar el ciclo.

---

## 2. Personalización de la Landing Page
*(Módulo Visual)*

Este módulo permite actualizar la oferta visual del sitio público.
*   **Hero (Carrusel):** Ya no necesita escribir direcciones web. Simplemente haga clic en "Cambiar Imagen" y suba el archivo desde su computadora. Puede gestionar varios slides con textos personalizados.
*   **Servicios y Categorías:** Personalice las imágenes y descripciones de lo que ofrece en la página de inicio.

---

## 3. Gestión Avanzada de Presupuestos (PDFs)
El sistema genera PDFs profesionales de forma automática.
*   **Soporte Multimoneda:** En el Dashboard, puede alternar entre **USD** y **VES**. Al generar el PDF, este adoptará la moneda seleccionada en pantalla.
*   **Tasa BCV:** Si genera el PDF en Bolívares, se incluirá automáticamente una nota al pie con la tasa oficial del BCV utilizada.

---

## 4. Cobranza y Pagos Multimoneda
Dada la realidad económica en Venezuela, el sistema permite un registro híbrido y transparente:
1.  **Pagos en Dólares:** Registro directo del monto que reduce la deuda.
2.  **Pagos en Bolívares (VES):** 
    *   El sistema sincroniza automáticamente la tasa del BCV (o permite ajustarla manualmente).
    *   Usted ingresa el monto en Bs. y el sistema calcula el equivalente en $ para abonar al presupuesto.
3.  **Gestión de IGTF:**
    *   Al registrar un pago (ya sea en $ o Bs.), verá la opción **"¿Aplica IGTF?"**.
    *   Si se marca, el sistema calcula el impuesto adicional (ej: 3%) sobre el monto recibido.
    *   **Nota Contable:** El monto del IGTF se registra como un cargo de impuesto adicional y **no resta** saldo de la deuda principal del presupuesto, manteniendo la precisión financiera.
4.  **Registro Histórico:** El sistema "congela" la tasa y los impuestos aplicados el día del pago.

---

## 5. Matriz de Roles y Permisos

| Funcionalidad | Administrador | Comercial | Contable | Operaciones | Usuario |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Configurar Identidad | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear Clientes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear Presupuestos | ✅ | ✅ | ✅ | ❌ | ✅ |
| Aprobar Presupuestos | ✅ | ❌ | ✅ | ❌ | ❌ |
| Validar Pagos | ✅ | ❌ | ✅ | ❌ | ❌ |
| Gestionar Catálogo | ✅ | ❌ | ✅ | ❌ | ❌ |
| Ver Reportes | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cargar Orden Entrega | ✅ | ❌ | ✅ | ✅ | ❌ |
| Ver Auditoría | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 6. Centro de Inteligencia (Reportes)
El sistema cuenta con un motor de análisis que transforma los datos operativos en información estratégica.

### Vistas Especializadas por Rol:
Al entrar a la sección de **"Reportes"**, el sistema detectará su rol y le mostrará la información más relevante por defecto:

1.  **Módulo Comercial (Gerencia y Ventas):**
    *   **Top de Ventas:** Visualización de cuáles son los productos más solicitados de su catálogo.
    *   **Ranking de Clientes:** Listado de los clientes con mayor volumen de compra en el periodo actual.
2.  **Módulo Contable (Administración):**
    *   **Distribución de Ingresos:** Gráficos circulares que muestran qué tipo de concreto genera más ingresos reales (pagos liquidados).
    *   **Análisis de Mora (Cartera):** Clasificación de deudas pendientes en tres niveles: *Al día*, *Vencido* y *Crítico* (más de 30 días).
3.  **Módulo Operacional (Planta y Logística):**
    *   **Cronograma de Despachos:** Tabla organizada de las próximas entregas aprobadas y pagadas.
    *   **Concentración por Zonas:** Gráfico de impacto geográfico que indica hacia qué zonas de Manzanillo se están moviendo las obras, útil para optimizar rutas de camiones.

### Exportación de Datos:
Todos los reportes pueden ser descargados en formato **PDF** para presentaciones o **Excel** para análisis manual profundo.

---

## 7. Soporte y Solución de Problemas
*   **¿Por qué el PDF no muestra mi dirección o logo?** Asegúrese de haber llenado todos los campos en la sección **"Identidad Corporativa"** dentro de la página de **"Configuración"** y haber hecho clic en "Guardar Cambios Corporativos".
*   **¿Puedo registrar un pago parcial?** Sí. El sistema calculará el saldo pendiente automáticamente y lo mostrará tanto en el dashboard como en los nuevos PDFs que genere.
*   **Error de Tasa BCV:** Si por algún motivo el sistema no puede conectar con el BCV, usted puede ingresar la tasa manualmente en el formulario de pago.
