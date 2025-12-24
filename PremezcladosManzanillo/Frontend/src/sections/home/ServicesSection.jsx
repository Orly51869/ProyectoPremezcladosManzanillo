import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContentCard from '../../components/ContentCard.jsx';

const ServicesSection = () => {
  const [services, setServices] = useState([
    { title: "Servicio de Bombeo", description: "Llegamos a cualquier altura.", imgSrc: "/assets/Bombeo.png", link: "/servicios#bombeo" },
    { title: "Asesoría Técnica", description: "Expertos te guían en tu proyecto.", imgSrc: "/assets/Asesoria.png", link: "/servicios#asesoria" },
    { title: "Entrega Express", description: "Garantizamos tu concreto a tiempo.", imgSrc: "/assets/Entrega.png", link: "/servicios#entrega" },
  ]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.services_config) {
          try { setServices(JSON.parse(data.services_config)); } catch (e) { console.error(e); }
        }
      });
  }, []);

  return (
    <section id="servicios" className="py-12">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-10 text-center">Nuestros Servicios</h2>

      {/* 💥 Layout de 3 columnas en escritorio 💥 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="h-full transition duration-300 hover:scale-[1.02]"
          >
            <Link to={service.link || "/servicios"}>
              <ContentCard {...service} />
            </Link>
          </div>
        ))}
      </div>

      {/* Botón para ver más servicios */}
      <div className="text-center mt-12">
        <Link
          to="/servicios"
          className="inline-block bg-white text-brand-primary font-bold px-8 py-3 rounded-full text-lg border-2 border-brand-primary hover:bg-green-50 transition shadow-md dark:bg-dark-surface dark:text-gray-100 dark:border-brand-primary"
        >
          Conocer Más Sobre Nuestros Servicios
        </Link>
      </div>
    </section>
  );
};

export default ServicesSection;