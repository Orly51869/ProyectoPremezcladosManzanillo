import React from 'react';
import { Link } from 'react-router-dom'; // Importar Link
import ContentCard from '../../components/ContentCard'; 

const ServicesSection = ({ className }) => {
  // Datos simulados (puedes reemplazarlos más tarde)
  const services = [
    { title: "Servicio de Bombeo", description: "Llegamos a cualquier altura.", imgSrc: "/assets/Bombeo.png" },
    { title: "Asesoría Técnica", description: "Expertos te guían en tu proyecto.", imgSrc: "/assets/Asesoria.png" },
    { title: "Entrega Express", description: "Garantizamos tu concreto a tiempo.", imgSrc: "/assets/Entrega.png" },
  ];
  
  return (
    <section id="servicios" className={`py-12 ${className}`}>
      {/* 💥 Título en Dark Mode 💥 */}
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Nuestros Servicios</h2>
      
      {/* 💥 Layout de 3 columnas en escritorio 💥 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="h-full transition duration-300 hover:scale-[1.02]"
          >
            <ContentCard {...service} />
          </div>
        ))}
      </div>

      {/* Botón para ver más servicios */}
      <div className="text-center mt-10">
        <Link
          to="/servicios"
          className="inline-block bg-transparent border-2 border-brand-primary text-brand-primary dark:border-green-400 dark:text-green-400 font-semibold px-6 py-2 rounded-full hover:bg-brand-primary hover:text-white dark:hover:bg-green-600 dark:hover:text-white transition"
        >
          Conocer Más Sobre Nuestros Servicios
        </Link>
      </div>
    </section>
  );
};

export default ServicesSection;