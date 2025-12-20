<p align="center">
  <img src="../Frontend/public/assets/LOGO_PREMEZCLADOS.svg" alt="Logo Premezclado Manzanillo" width="200">
</p>

# 📘 Guía de Usuario - Premezclado Manzanillo

Esta guía proporciona una explicación exhaustiva de todas las herramientas disponibles en la plataforma de Premezclado Manzanillo. Está diseñada para guiar tanto a nuevos administradores en la configuración inicial como al personal operativo en el día a día.

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
    *   Defina **Categorías** (ej: Concretos, Bombeo, Aditivos).
    *   Agregue productos con su **Precio Base** y **Unidad de Medida**.

2.  **Carga Masiva (Recomendado para inventarios grandes):**
    *   Vaya a **"Configuración"** -> **"Importar Datos"**.
    *   Prepare un archivo **CSV** con los siguientes encabezados obligatorios:
        *   `nombre`: Nombre del producto.
        *   `precio`: Monto en USD (use punto para decimales, ej: 150.50).
        *   `tipo`: Unidad de medida o tipo (ej: m3, viaje, kg). Este aparece como "TIPO" en la tabla.
        *   `categoria`: Nombre de la categoría a la que pertenece (ej: Estructurales, Especiales).
    *   Seleccione el archivo y haga clic en **"Procesar Archivo"**. El sistema creará automáticamente las categorías que no existan.

### Paso 3: Registro de Clientes
1.  Vaya a la sección **"Clientes"**.
2.  Registre a sus clientes recurrentes o nuevos.
    *   Es obligatorio el **RIF o Cédula** para la validez legal del presupuesto.
    *   Asegúrese de escribir correctamente el correo para futuras notificaciones.

### Paso 4: Ciclo de Venta (Presupuestos y Pagos)
Una vez configurado lo anterior, el sistema está listo para operar:
1.  Crear **Presupuesto** (Cotización).
2.  **Aprobación:** Si es Administrador o Contable, revise y apruebe la cotización.
3.  **Registro de Pago:** Registre el abono (en $ o Bs.).
4.  **Facturación:** El sistema genera la Proforma tras validar el pago.

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

| Funcionalidad | Administrador | Comercial | Contable | Usuario (Cliente) |
| :--- | :---: | :---: | :---: | :---: |
| Configurar Identidad | ✅ | ❌ | ❌ | ❌ |
| Crear Clientes | ✅ | ✅ | ❌ | ❌ |
| Crear Presupuestos | ✅ | ✅ | ✅ | ✅ |
| Aprobar Presupuestos | ✅ | ❌ | ✅ | ❌ |
| Gestionar Catálogo | ✅ | ❌ | ✅ | ❌ |
| Validar Pagos | ✅ | ❌ | ✅ | ❌ |
| Ver Auditoría | ✅ | ❌ | ❌ | ❌ |

---

## 6. Soporte y Solución de Problemas
*   **¿Por qué el PDF no muestra mi dirección o logo?** Asegúrese de haber llenado todos los campos en la sección **"Identidad Corporativa"** dentro de la página de **"Configuración"** y haber hecho clic en "Guardar Cambios Corporativos".
*   **¿Puedo registrar un pago parcial?** Sí. El sistema calculará el saldo pendiente automáticamente y lo mostrará tanto en el dashboard como en los nuevos PDFs que genere.
*   **Error de Tasa BCV:** Si por algún motivo el sistema no puede conectar con el BCV, usted puede ingresar la tasa manualmente en el formulario de pago.

