import React from 'react';
import HomepageNavbar from '../components/HomepageNavbar.jsx';
import Footer from '../components/Footer.jsx';

const storyMilestones = [
  {
    year: '1998',
    title: 'Fundación en Manzanillo',
    description:
      'Nacimos como una planta familiar para atender proyectos residenciales en la isla de Margarita.',
  },
  {
    year: '2008',
    title: 'Expansión Logística',
    description:
      'Incorporamos nuestra primera flotilla de camiones mezcladores y el servicio de bombeo para obras verticales.',
  },
  {
    year: '2016',
    title: 'Certificación de Calidad',
    description:
      'Obtuvimos la certificación nacional que avala la calidad de nuestras mezclas y procesos de producción.',
  },
  {
    year: '2024',
    title: 'Impulso Tecnológico',
    description:
      'La digitalización de nuestros procesos comerciales nos acerca más a nuestros clientes y socios.',
  },
];

const companyValues = [
  {
    title: 'Compromiso con la Calidad',
    description:
      'Cada entrega se somete a controles rigurosos para garantizar la resistencia y durabilidad de nuestros concretos.',
    icon: '🏗️',
  },
  {
    title: 'Seguridad Primero',
    description:
      'Invertimos en capacitación continua para nuestro personal y aliados en obra, asegurando operaciones sin riesgos.',
    icon: '🛡️',
  },
  {
    title: 'Alianza con el Cliente',
    description:
      'Trabajamos mano a mano con constructores, arquitectos e ingenieros para adaptar cada mezcla a sus necesidades.',
    icon: '🤝',
  },
  {
    title: 'Innovación Sostenible',
    description:
      'Optimizamos procesos para reducir desperdicios y consumo energético dentro de la planta.',
    icon: '🌱',
  },
];

const highlightStats = [
  { value: '+25', label: 'Años impulsando proyectos en Nueva Esparta' },
  { value: '180+', label: 'Obras industriales, residenciales y viales atendidas' },
  { value: '24/7', label: 'Monitoreo y soporte para obras críticas' },
  { value: '99%', label: 'Índice de entregas puntuales en 2024' },
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
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                Proveer soluciones de concreto confiables y adaptadas a cada proyecto,
                con un servicio cercano y flexible que permita a nuestros clientes construir
                con seguridad, puntualidad y eficiencia.
              </p>
            </div>
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nuestra Visión</h2>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                Ser la empresa de referencia en soluciones de concreto del oriente venezolano,
                integrando innovación, tecnología y procesos sostenibles que eleven el estándar
                constructivo de la región.
              </p>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="mt-16 bg-white dark:bg-dark-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Nuestros Valores nos Guían
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-300">
              Un equipo comprometido, procesos transparentes y decisiones orientadas a la seguridad
              y la satisfacción de nuestros clientes.
            </p>
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
                    <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
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
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

        {/* Historia */}
        <section className="mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Nuestra Historia en Breve
          </h2>
          <div className="mt-10 space-y-8">
            {storyMilestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className="relative bg-white dark:bg-dark-surface border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-full w-1 bg-brand-primary dark:bg-dark-btn" />
                <div className="pl-6">
                  <span className="inline-block text-sm font-semibold text-brand-primary dark:text-dark-btn uppercase tracking-wide">
                    {milestone.year}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-brand-primary to-emerald-700 dark:from-dark-btn dark:to-emerald-500 shadow-2xl px-10 py-12 md:py-16 text-white text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
              <div className="md:col-span-2">
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  Construyamos la próxima obra emblemática de Margarita
                </h2>
                <p className="mt-4 text-lg text-white/80">
                  Nuestro equipo comercial y técnico está listo para asesorarte desde la planificación
                  hasta la colocación final del concreto.
                </p>
              </div>
              <div className="flex md:justify-end">
                <a
                  href="/contacto"
                  className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-full bg-white text-brand-primary hover:bg-green-100 transition"
                >
                  Coordinar una Reunión
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;

