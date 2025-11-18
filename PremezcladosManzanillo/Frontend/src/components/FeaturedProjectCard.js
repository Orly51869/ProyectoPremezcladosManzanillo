/*************************************/
/**       FeatureProjectCard        **/
/*************************************/
// Archivo para renderizar los proyectos en el inicio

// Librerías y módulos 
import React from 'react';
//Componente principal
const FeaturedProjectCard = ({ title, location, category, imgSrc, className = '' }) => {
  const badgeLabel = location ?? category ?? 'Proyecto destacado';
  return (
    <div className={`relative w-full h-80 rounded-xl overflow-hidden shadow-xl group ${className}`}>
      {/* Imagen de Fondo */}
      <img
        src={imgSrc}
        alt={title}
        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/80 transition duration-300 group-hover:from-black/90 group-hover:to-black/90" />

      {/* Contenido */}
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div>
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-brand-primary text-white rounded-full shadow-md">
            {badgeLabel}
          </span>
          <h3 className="mt-4 text-2xl font-bold text-white drop-shadow-lg leading-snug">
            {title}
          </h3>
        </div>

        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition">
          <span className="text-sm font-semibold text-white/80 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
            Explorar proyecto
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProjectCard;