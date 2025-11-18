import React from 'react';
import HomepageNavbar from '../components/HomepageNavbar';
import Footer from '../components/Footer';

const companyValues = [
  {
    title: 'Servicio al cliente',
    description:
      'Enfocado hacia la satisfacción de las necesidades del cliente, comprendiendo que esto es el elemento diferenciador para competir y alcanzar nuestras metas.',
    icon: '🤝',
  },
  {
    title: 'Integridad',
    description:
      'Actuando siempre de manera respetuosa, honesta y responsable.',
    icon: '🛡️',
  },
  {
    title: 'Competitividad',
    description:
      'El conjunto de conductas de todos los niveles de la organización que permiten disputar o competir con los demás agentes del mercado en la prestación del servicio, con alta calidad y al menor costo posible.',
    icon: '🏆',
  },
  {
    title: 'Compromiso',
    description:
      'Se manifiesta por la identificación y lealtad del trabajador con la empresa, la mística en el trabajo y el sentido de responsabilidad; en una institución que prioriza el trato justo y se ocupa del desarrollo integral del trabajador y su calidad de vida.',
    icon: '🌟',
  },
];

const highlightStats = [
  { value: '+15', label: 'Años impulsando proyectos en Nueva Esparta' },
  { value: '180+', label: 'Obras industriales, residenciales y viales atendidas' },
  { value: '24/7', label: 'Monitoreo y soporte para obras críticas' },
];

const AboutPage = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-primary">
      <HomepageNavbar />
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="relative rounded-3xl h-80 md:h-96 shadow-2xl">
            <img
              src="/assets/Toma frontal Planta.jpeg"
              alt="Planta de producción de concreto"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70" />
            <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-14 text-white">
              <span className="text-sm uppercase tracking-[0.35em] text-white/80">
                Quiénes Somos
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-white">
                Concreto confiable para construir el futuro de Margarita
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-white/80">
                Premezclado Manzanillo, C.A. combina experiencia técnica, logística
                eficiente y asesoría especializada para acompañar cada obra desde la excavación
                hasta el colado final.
              </p>
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nuestra Misión</h2>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-justify">
                Producir y distribuir el mejor concreto premezclado, siguiendo los mas altos estándares de Eficiencia, Calidad y Confiabilidad; mediante el mejoramiento continuo de nuestros procesos, cubriendo todas las necesidades y expectativas de nuestros clientes.
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nuestra Visión</h2>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-justify">
                Ser reconocida como la mejor empresa proveedora de Concreto Premezclado del Estado Nueva Esparta, brindando un excelente servicio profesional y comercializando los mejores productos de altísima calidad, satisfaciendo las necesidades y expectativas de construcción de nuestros clientes, ayudando al desarrollo económico y social de la empresa, de nuestros trabajadores , de la región y del país en general.
              </p>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="mt-16 bg-white dark:bg-dark-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Nuestros Valores
            </h2>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {companyValues.map((value) => (
                <div
                  key={value.title}
                  className="flex items-start gap-4 bg-gray-50 dark:bg-dark-primary/60 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {value.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{value.title}</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Indicadores */}
        <section className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl p-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Resultados que respaldan nuestra trayectoria
            </h2>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
              {highlightStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 dark:bg-dark-primary/70 border border-gray-200 dark:border-white/10 p-6 shadow-sm text-center"
                >
                  <span className="text-3xl font-extrabold text-brand-primary dark:text-dark-btn">
                    {stat.value}
                  </span>
                  <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
