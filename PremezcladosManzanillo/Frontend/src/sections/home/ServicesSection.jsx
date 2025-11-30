import React from 'react';
import { Link } from 'react-router-dom'; // Importar Link
import ContentCard from '../../components/ContentCard.jsx';

const ServicesSection = () => {
  // Datos simulados (puedes reemplazarlos más tarde)
  const services = [
    { title: "Servicio de Bombeo", description: "Llegamos a cualquier altura.", imgSrc: "/assets/Bombeo.png" },
    { title: "Asesoría Técnica", description: "Expertos te guían en tu proyecto.", imgSrc: "/assets/Asesoria.png" },
    { title: "Entrega Express", description: "Garantizamos tu concreto a tiempo.", imgSrc: "/assets/Entrega.png" },
  ];
  
  return (
    <section id="servicios" className="py-12">
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
      <div className="text-center mt-12">
        <Link
          to="/servicios"
          className="inline-block px-8 py-3 text-lg font-semibold text-white bg-green-700 rounded-lg shadow-md hover:bg-green-800 transition-colors duration-300 transform hover:scale-105"
        >
          Conocer Más Sobre Nuestros Servicios
        </Link>
      </div>
    </section>
  );
};

export default ServicesSection;