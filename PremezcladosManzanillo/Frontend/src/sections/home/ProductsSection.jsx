import React from 'react';
import ContentCard from '../../components/ContentCard.jsx'; 
import { Link } from 'react-router-dom';

// Se puede importar directamente la data para los títulos, pero por simplicidad de la sección Home, definimos tarjetas enfocadas en la categoría.
const productCategoriesCards = [
    { 
        id: 'estructurales', 
        title: "Concretos Estructurales", 
        description: "Mezclas de alta resistencia para cimentaciones, columnas y losas.", 
        imgSrc: "/assets/Concreto.png" // Reutilizar la imagen del concreto
    },
    { 
        id: 'pavimentos', 
        title: "Concretos para Pavimentos", 
        description: "Diseñados para soportar cargas dinámicas en vialidades y patios de maniobra.", 
        imgSrc: "/assets/Concreto Pavimento.png"
    },
    { 
        id: 'especiales', 
        title: "Concretos Especiales", 
        description: "Rellenos fluidos y mezclas autocompactables para aplicaciones específicas.", 
        imgSrc: "/assets/Edificio.png"
    }    
];

const ProductsSection = () => {
  return (
    <section id="productos" className="py-12">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">Nuestros Productos Destacados</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Enlaces dinámicos a cada categoría de producto */}
        {productCategoriesCards.map((category) => (
          <Link 
            key={category.id} 
            to={`/productos/${category.id}`} // Enlace dinámico a la categoría
            className="block h-full transition duration-300 hover:scale-[1.02]"
          >
            {/* El ContentCard debe ser lo suficientemente genérico para mostrar la categoría */}
            <ContentCard {...category} /> 
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <Link 
            to="/productos" 
            className="inline-block bg-transparent border-2 border-brand-primary text-brand-primary dark:border-green-400 dark:text-green-400 font-semibold px-6 py-2 rounded-full hover:bg-brand-primary hover:text-white dark:hover:bg-green-600 dark:hover:text-white transition"
        >
            Ver Catálogo Completo
        </Link>
      </div>
    </section>
  );
};

export default ProductsSection;
