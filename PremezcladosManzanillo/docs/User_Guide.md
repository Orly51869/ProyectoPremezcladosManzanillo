# 📘 Guía de Usuario Detallada - Premezclado Manzanillo

Esta guía proporciona una explicación exhaustiva de todas las herramientas disponibles en la plataforma de Premezclado Manzanillo, diseñada para optimizar la gestión comercial y técnica de la empresa.

---

## 1. Acceso y Configuración Inicial
### Inicio de Sesión
La plataforma utiliza **Auth0** para una seguridad de grado bancario. 
1. Acceda a la URL principal.
2. Haga clic en **"Iniciar Sesión"**. Será redirigido al portal seguro.
3. Puede usar sus credenciales corporativas o registrarse. 
   - *Nota:* Los nuevos usuarios registrados tendrán el rol de **Usuario** por defecto y permisos limitados hasta que un administrador los promueva.

### Perfil de Usuario
En la esquina superior derecha del Dashboard, encontrará su avatar circular. Al hacer clic, podrá ver su correo electrónico vinculado y cerrar la sesión de forma segura.

---

## 2. Personalización de la Landing Page (Módulo Visual)
*(Exclusivo para Administradores y Comerciales)*

Este módulo permite que el equipo de ventas actualice la oferta visual del sitio público sin depender de desarrolladores.

### Secciones Modificables:
1.  **Banner Principal (Hero):**
    *   **Imágenes:** Puede gestionar un carrusel dinámico. Se recomiendan imágenes de alta resolución (mínimo 1920x1080px) de la planta o proyectos terminados.
    *   **Textos:** Cada imagen puede llevar una frase de impacto diferente.
2.  **Catálogo Destacado (Home):** 
    *   Permite seleccionar qué categorías de concreto (Estructural, Pavimentos, etc.) se muestran en la página de inicio para captar la atención del cliente.
3.  **Servicios Destacados:** 
    *   Actualización de descripciones e imágenes para servicios como "Bombeo de Concreto" o "Laboratorio".

---

## 3. Flujo de Ventas: De Cliente a Presupuesto

### Gestión de Clientes
Antes de generar un presupuesto, el cliente debe existir en la base de datos.
- **RIF/Cédula:** El sistema valida que el formato sea correcto.
- **Asignación:** Los clientes creados por un usuario son visibles para ese usuario, pero los Administradores tienen una visión global de toda la cartera.

### Constructor de Presupuestos (El "Corazón" del Sistema)
Es una herramienta interactiva donde se diseña la solución técnica para la obra:
1.  **Configuración General:** Nombre del proyecto y fecha estimada de colado.
2.  **Selección de Mezcla:** Elija el tipo de concreto (por ejemplo, C-210 o C-250).
3.  **Servicios Adicionales:** Añada metros de tubería de bombeo o aditivos hidrófugos/fibras.
4.  **Cálculo Automático:** El sistema calcula el precio de la mezcla y el total en tiempo real según los precios vigentes en el catálogo.

---

## 4. Gestión de Pagos y Comprobantes
Los usuarios pueden reportar sus pagos directamente:
1.  Seleccione el presupuesto aprobado.
2.  Suba la imagen de la transferencia o depósito.
3.  **Estados del Pago:**
    - **Pendiente:** El pago ha sido reportado pero no validado.
    - **Validado:** El departamento contable confirmó los fondos. El presupuesto se marca como "Pagado".

---

## 5. Matriz de Roles y Permisos (Detallada)

| Funcionalidad | Administrador | Comercial | Contable | Usuario (Cliente) |
| :--- | :---: | :---: | :---: | :---: |
| Crear Clientes | ✅ | ✅ | ❌ | ❌ |
| Crear Presupuestos | ✅ | ✅ | ✅ | ✅ |
| Aprobar Presupuestos | ✅ | ❌ | ✅ | ❌ |
| Modificar Precios | ✅ | ❌ | ✅ | ❌ |
| Personalizar Web | ✅ | ✅ | ❌ | ❌ |
| Gestionar Roles | ✅ | ❌ | ❌ | ❌ |
| Eliminar Usuarios | ✅ | ❌ | ❌ | ❌ |
| Ver Auditoría | ✅ | ❌ | ❌ | ❌ |

---

## 6. Reportes y Estadísticas
*(Solo Administradores y Contables)*
El sistema genera visualizaciones de:
- **Volumen de Ventas:** M3 de concreto proyectados vs. despachados.
- **Estado de Cartera:** Montos pendientes por cobrar y pagos por validar.
- **Actividad:** Seguimiento de cotizaciones generadas por cada vendedor.

---

## 7. Soporte y FAQs
- **¿Qué pasa si elimino a un usuario?** Se elimina su acceso de Auth0 y su registro local. Sus presupuestos y clientes creados NO se eliminan, pero quedan huérfanos para que un administrador los reasigne.
- **¿Cómo actualizo los precios del concreto?** Debe ir a la sección "Productos" en el dashboard. Los cambios afectan a los presupuestos *nuevos*, los antiguos mantienen el precio de cuando fueron creados para respetar la oferta al cliente.
- **Error de Carga de Comprobante:** Asegúrese de que el archivo sea menor a 5MB y en formato JPG, PNG o PDF.

