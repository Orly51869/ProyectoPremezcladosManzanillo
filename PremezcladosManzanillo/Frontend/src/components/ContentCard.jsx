/*************************************/
/**           ContentCard           **/
/*************************************/
// Archivo para renderizar las tarjetas como componente principal

// Librerías y módulos 
import React from 'react';

// Componente principal
const ContentCard = ({ title, description, imgSrc }) => (
  <div className="relative h-80 bg-white dark:bg-dark-surface rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-dark-surface group">
    
    {/* Imagen de la tarjeta */}
    <img 
      src={imgSrc} 
      alt={title} 
      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
    />
    
    {/* Overlay para mejorar la visibilidad del texto (Similar a FeaturedProjectCard) */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6">
      <div className="text-white">
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{title}</h3>
        <p className="text-sm text-gray-100 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  </div>
);

export default ContentCard;