/*************************************/
/**            HeroSection          **/
/*************************************/
// Archivo para renderizar la sección Hero de la página de inicio

// Librerías y módulos 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = () => {
  const [images, setImages] = useState([
    '/assets/Hero.png',
    '/assets/Toma frontal Planta.jpeg',
    '/assets/Toma araña Planta.jpeg',
    '/assets/Toma aerea Planta.jpeg',
  ]);
  const [texts, setTexts] = useState([
    "Calidad y resistencia para los proyectos que construyen nuestro futuro.",
    "Tu obra, nuestra prioridad. Concreto premezclado entregado a tiempo.",
    "Innovación en cada mezcla. Soluciones de concreto para desafíos modernos.",
    "Construye con confianza. La base de tu proyecto comienza con nosotros."
  ]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Cargar configuraciones dinámicas
    const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.hero_config) {
          try {
            const config = JSON.parse(data.hero_config);
            if (config.images) setImages(config.images);
            if (config.texts) setTexts(config.texts);
          } catch (e) { console.error("Error parsing hero_config", e); }
        }
      })
      .catch(err => console.error("Error loading settings", err));
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex >= images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [images]);

  const goToSlide = (slideIndex) => {
    setCurrentImageIndex(slideIndex);
  };

  return (
    // Contenedor principal con márgenes, altura, bordes redondeados y overflow hidden
    <section className="relative h-[85vh] flex items-end justify-center text-white overflow-hidden rounded-xl mb-16 shadow-2xl">

      <AnimatePresence>
        <motion.img
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt="Fondo de construcción"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      {/* Capa oscura para mejorar legibilidad del texto */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Contenido de texto animado */}
      <motion.div
        className="relative z-10 text-center p-4 mb-16"
        key={currentImageIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-white max-w-4xl mx-auto">{texts[currentImageIndex]}</h1>

      </motion.div>

      {/* Puntos de Navegación */}
      <div className="absolute bottom-5 z-10 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'
              }`}
            aria-label={`Ir a la imagen ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;