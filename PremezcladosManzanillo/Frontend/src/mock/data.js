export const mockClients = [
  { id: 1, name: 'Constructora XYZ', rif: 'J-12345678-9', address: 'Av. Principal, Edif. ABC' },
  { id: 2, name: 'Inversiones Marítimas C.A.', rif: 'J-87654321-0', address: 'Zona Industrial, Galpón 10' },
  { id: 3, name: 'Hogar Futuro S.R.L.', rif: 'J-23456789-1', address: 'Urb. Las Palmas, Calle 3' },
];

export const mockBudgets = [
  {
    id: 'p-001',
    folio: 'P-001',
    clientId: 1,
    clientName: 'Constructora XYZ',
    title: 'Edificio Residencial A',
    amount: 12500.50,
    status: 'approved',
    createdAt: '2024-07-15T10:00:00Z',
    // form data
    nombreProyecto: 'Edificio Residencial A',
    fechaColado: '2024-08-01',
    resistencia: '250',
    tipoConcreto: 'bombeable',
    volumen: 80.5,
  },
  {
    id: 'p-002',
    folio: 'P-002',
    clientId: 2,
    clientName: 'Inversiones Marítimas C.A.',
    title: 'Muro de contención puerto',
    amount: 7800.00,
    status: 'pending',
    createdAt: '2024-07-18T14:30:00Z',
    nombreProyecto: 'Muro de contención puerto',
    fechaColado: '2024-08-01',
    resistencia: '300',
    tipoConcreto: 'convencional',
    volumen: 45,
  },
];

export const mockPayments = [
  { id: 1, budgetId: 'p-001', paidAmount: 5000, pending: 7500.50, date: '2024-07-20T11:00:00Z' },
  { id: 2, budgetId: 'p-001', paidAmount: 2500.50, pending: 5000, date: '2024-08-01T15:00:00Z' },
];

export const mockProducts = {
    'concreto-estructural': {
        id: 'concreto-estructural',
        title: 'Concreto Estructural',
        subtitle: 'Conoce nuestros productos de concreto.',
        description: 'El concreto estructural es el pilar de cualquier proyecto de construcción, ofreciendo resistencia, durabilidad y la capacidad de soportar grandes cargas estructurales. Es la elección ideal para cimentaciones, columnas y losas de alta exigencia. Ofrecemos diferentes resistencias (f\'c) y tiempos de fraguado.',
        imageSrc: '/assets/Concreto.png', // Placeholder de imagen
        benefits: [
            'Fuerza y durabilidad garantizada (f\'c=250 a 400 kg/cm²)',
            'Excelente trabajabilidad para colocación',
            'Resistencia optimizada para tu proyecto',
            'Cumplimiento con normas de construcción'
        ],
        categories: ['Estructural', 'Cimentación', 'Alta Resistencia'],
        relatedProducts: [
            { id: 'tubos-concreto', title: 'Tubos de Concreto' },
            { id: 'bloques-concreto', title: 'Bloques de Concreto' }
        ]
    },
    'tubos-concreto': {
        id: 'tubos-concreto',
        title: 'Tubos de Concreto',
        subtitle: 'Soluciones para sistemas de drenaje.',
        description: 'Tubos de concreto reforzado diseñados para el manejo eficiente de agua pluvial y sanitaria en proyectos de infraestructura.',
        imageSrc: '/assets/Tubos.png', 
        benefits: [
            'Alta durabilidad y resistencia a la corrosión',
            'Fácil instalación',
            'Variedad de diámetros',
            'Larga vida útil'
        ],
        categories: ['Drenaje', 'Infraestructura', 'Saneamiento'],
        relatedProducts: [
            { id: 'concreto-estructural', title: 'Concreto Estructural' },
            { id: 'bloques-concreto', title: 'Bloques de Concreto' }
        ]
    },
    'bloques-concreto': {
        id: 'bloques-concreto',
        title: 'Bloques de Concreto',
        subtitle: 'Para muros y acabados específicos.',
        description: 'Unidades de mampostería utilizadas para la construcción de muros portantes y no portantes. Ofrecen aislamiento térmico y acústico.',
        imageSrc: '/assets/Bloques.png', 
        benefits: [
            'Excelentes propiedades aislantes',
            'Rápida construcción',
            'Resistencia al fuego',
            'Bajo mantenimiento'
        ],
        categories: ['Muros', 'Acabados', 'Aislamiento'],
        relatedProducts: [
            { id: 'concreto-estructural', title: 'Concreto Estructural' },
            { id: 'tubos-concreto', title: 'Tubos de Concreto' }
        ]
    }
};

export const productCategories = [
    {
        id: 'estructurales',
        title: 'Concretos Estructurales',
        subtitle: 'Desarrollados para ofrecer alta resistencia y desempeño confiable en elementos como columnas, vigas, losas y fundaciones.',
        description: 'Disponibles en diferentes grados según las exigencias del proyecto. (Disponible con asentamiento normal 5” o con bomba 7”, según el método de colocación requerido).',
        heroImageSrc: '/assets/Concreto.png',
        products: [
            { id: 'c-100', title: 'Concreto 100 kg/cm²', description: 'Ideal para obras livianas o no estructurales.', f_c: '100 kg/cm²', imageSrc: '/assets/Concreto.png' },
            { id: 'c-120', title: 'Concreto 120 kg/cm²', description: 'Para cimentaciones o pisos de baja carga.', f_c: '120 kg/cm²', imageSrc: '/assets/Concreto.png' },
            { id: 'c-150', title: 'Concreto 150 kg/cm²', description: 'Recomendado para estructuras ligeras o muros.', f_c: '150 kg/cm²', imageSrc: '/assets/Concreto.png' },
            { id: 'c-210', title: 'Concreto 210 kg/cm²', description: 'Uso general en estructuras residenciales y comerciales.', f_c: '210 kg/cm²', imageSrc: '/assets/Concreto.png' },
            { id: 'c-250', title: 'Concreto 250 kg/cm²', description: 'Excelente equilibrio entre resistencia y trabajabilidad.', f_c: '250 kg/cm²', imageSrc: '/assets/Concreto.png' },
            { id: 'c-280', title: 'Concreto 280 kg/cm²', description: 'Ideal para estructuras de mayor exigencia.', f_c: '280 kg/cm²', imageSrc: '/assets/Concreto.png' },
            { id: 'c-300', title: 'Concreto 300 kg/cm²', description: 'Para proyectos industriales o de alta carga.', f_c: '300 kg/cm²', imageSrc: '/assets/Concreto.png' },
            { id: 'c-350', title: 'Concreto 350 kg/cm²', description: 'Máxima resistencia para aplicaciones especiales.', f_c: '350 kg/cm²', imageSrc: '/assets/Concreto.png' },
        ]
    },
    {
        id: 'pavimentos',
        title: 'Concretos para Pavimentos',
        subtitle: 'Diseñados para soportar tránsito vehicular y ofrecer una superficie durable y uniforme.',
        description: 'Recomendados para calles, avenidas, patios de maniobra y zonas industriales.',
        heroImageSrc: '/assets/Concreto-Pavimento.png',
        products: [
            { id: 'pavi-vial-40', title: 'PAVI-VIAL 40', description: 'Pavimentos de tráfico ligero.', f_c: null, imageSrc: '/assets/Carretera.png' },
            { id: 'pavi-vial-45', title: 'PAVI-VIAL 45', description: 'Calles urbanas o estacionamientos.', f_c: null, imageSrc: '/assets/Carretera.png' },
            { id: 'pavi-vial-50', title: 'PAVI-VIAL 50', description: 'Vías de tráfico medio o pesado.', f_c: null, imageSrc: '/assets/Carretera.png' },
            { id: 'pavi-vial-50-ft', title: 'PAVI-VIAL 50 FT', description: 'Pavimentos de alta resistencia con aditivos especiales.', f_c: null, imageSrc: '/assets/Carretera.png' },
        ]
    },
    {
        id: 'especiales',
        title: 'Concretos Especiales',
        subtitle: 'Formulados para aplicaciones con requerimientos específicos, donde se necesita una mezcla fluida, de fácil colocación y sin necesidad de vibrado.',
        description: 'Facilitan el trabajo, reducen tiempos de colocación y mejoran la compactación.',
        heroImageSrc: '/assets/Edificio.png',
        products: [
            { id: 'relleno-fluido-10', title: 'Relleno Fluido 10 kg/cm²', description: 'Ideal para relleno de ductos, zanjas o huecos.', f_c: '10 kg/cm²', imageSrc: '/assets/Bloques.png' },
            { id: 'relleno-fluido-20', title: 'Relleno Fluido 20 kg/cm²', description: 'Mayor resistencia para rellenos estructurales o áreas de difícil acceso.', f_c: '20 kg/cm²', imageSrc: '/assets/Bloques.png' },
        ]
    }
];

export const aditivosAdicionales = {
    title: 'Aditivos Adicionales',
    subtitle: 'Potencian el desempeño del concreto según las condiciones ambientales o del proyecto.',
    items: [
        { title: 'Hidrófugo', description: 'Aumenta la impermeabilidad y protege contra la humedad.', icon: 'droplet' },
        { title: 'Fibra', description: 'Reduce el agrietamiento y mejora la durabilidad superficial.', icon: 'layers-3' }
    ]
};

export const serviciosComplementarios = {
    title: 'Servicios Complementarios',
    subtitle: 'Acompañamos cada entrega con soluciones técnicas y logísticas que optimizan el trabajo en obra.',
    items: [
        { title: 'Bomba de Concreto', description: 'Servicio de bomba de concreto para agilizar el vaciado en altura o distancia.', icon: 'truck' },
        { title: 'Asesoría Técnica', description: 'Asesoría técnica personalizada por personal especializado.', icon: 'users-round' },
        { title: 'Recargos por Distancia', description: 'Costo adicional por distancia según la ubicación del proyecto.', icon: 'map-pin' }
    ]
};

export const mockProjects = [
    {
      title: "Centro Comercial La Vela",
      description: "Suministro de concreto de alta resistencia para la construcción de uno de los centros comerciales más grandes de la isla.",
      imgSrc: "/assets/project-1.png",
      category: "Edificación Comercial",
    },
    {
      title: "Autopista Circunvalación Norte",
      description: "Bombeo y colocación de concreto para pavimentos en la principal arteria vial de la región.",
      imgSrc: "/assets/project-2.png",
      category: "Infraestructura Vial",
    },
    {
      title: "Conjunto Residencial Costa Azul",
      description: "Concreto premezclado para la construcción de un complejo de edificios residenciales de lujo.",
      imgSrc: "/assets/project-3.png",
      category: "Vivienda Multifamiliar",
    },
    {
      title: "Edificio Residencial Sol Naciente",
      description: "Concreto estructural para un moderno edificio de apartamentos con vistas al mar.",
      imgSrc: "/assets/Edificio.png",
      category: "Vivienda Multifamiliar",
    },
    {
      title: "Planta de Tratamiento de Aguas",
      description: "Suministro de concretos especiales resistentes a agentes químicos para la nueva planta de tratamiento.",
      imgSrc: "/assets/Toma araña Planta.jpeg",
      category: "Infraestructura Sanitaria",
    },
    {
      title: "Hotel Boutique Coral",
      description: "Concreto bombeable para la construcción de un hotel boutique de cinco estrellas en la costa.",
      imgSrc: "/assets/Oficina.jpeg",
      category: "Hotelería y Turismo",
    }
  ];