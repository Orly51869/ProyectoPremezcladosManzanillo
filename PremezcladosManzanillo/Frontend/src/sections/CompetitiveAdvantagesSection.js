import React from 'react';
import { Award, Truck, Wrench } from 'lucide-react';

const CompetitiveAdvantagesSection = () => {
    
  // Datos de las tarjetas de Ventajas Competitivas
  const advantages = [
    {
      title: "Calidad Certificada",
      description: "Utilizamos aditivos de vanguardia y materias primas de primera, garantizando la durabilidad y resistencia de cada mezcla.",
      icon: Award,
    },
    {
      title: "Entrega y Logística Eficiente",
      description: "Nuestra flota moderna asegura la entrega del concreto en el tiempo pactado y en las condiciones óptimas para su uso.",
      icon: Truck,
    },
    {
      title: "Asesoría Técnica",
      description: "Soporte continuo de nuestro equipo de ingenieros para asegurar la correcta aplicación y desempeño de la mezcla en obra.",
      icon: Wrench,
    },
  ];

  return (
    <section id="ventajas" className="w-full py-20 bg-gray-50 dark:bg-dark-surface">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        {/* Título Principal */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-brand-text dark:text-gray-100 sm:text-4xl">
            ¿Por Qué Elegirnos? (Ventajas Competitivas)
          </h2>
        </div>

        {/* Contenedor de Tarjetas (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="p-8 bg-white dark:bg-dark-box rounded-2xl shadow-xl border-t-4 border-brand-primary transition duration-300 hover:shadow-2xl flex flex-col items-center text-center"
            >
              {/* Icono (Placeholder del modelo, ajustado con Lucide React) */}
              <div className="p-4 bg-brand-soft-bg dark:bg-brand-primary/10 rounded-full mb-6">
                <advantage.icon className="w-8 h-8 text-brand-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-brand-primary mb-3">
                {advantage.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-base">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompetitiveAdvantagesSection;
