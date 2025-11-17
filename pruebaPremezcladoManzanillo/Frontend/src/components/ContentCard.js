/*************************************/
/**           ContentCard           **/
/*************************************/
// Archivo para renderizar las tarjetas como componente principal

// Librerías y módulos 
import React from 'react';

// Componente principal
const ContentCard = ({ title, description, imgSrc }) => (
  <div className="relative bg-white dark:bg-dark-surface rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-dark-surface">
    
    {/* Imagen de la tarjeta */}
    <img 
      src={imgSrc} 
      alt={title} 
      className="w-full h-40 object-cover"
    />
    
    {/* Overlay para mejorar la visibilidad del texto */}
    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
      <div className="text-white"> {/* Texto siempre blanco sobre el overlay */}
        <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  </div>
);

export default ContentCard;