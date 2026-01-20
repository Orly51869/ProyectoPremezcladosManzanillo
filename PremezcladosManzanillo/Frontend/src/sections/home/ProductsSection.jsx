import React, { useState, useEffect } from 'react';
import ContentCard from '../../components/ContentCard.jsx';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const ProductsSection = () => {
  const [categories, setCategories] = useState([
    {
      id: 'estructurales',
      title: "Concretos Estructurales",
      description: "Mezclas de alta resistencia para cimentaciones, columnas y losas.",
      imgSrc: "/assets/Concreto.png",
      originalCategory: "General"
    },
    {
      id: 'pavimentos',
      title: "Concretos para Pavimentos",
      description: "Diseñados para soportar cargas dinámicas en vialidades y patios de maniobra.",
      imgSrc: "/assets/Concreto-Pavimento.png",
      originalCategory: "General"
    },
    {
      id: 'especiales',
      title: "Concretos Especiales",
      description: "Rellenos fluidos y mezclas autocompactables para aplicaciones específicas.",
      imgSrc: "/assets/Edificio.png",
      originalCategory: "General"
    }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const { data } = await api.get('/api/settings');
        // Check for catalog_config and valid content
        if (data.catalog_config) {
          try {
            const catalog = JSON.parse(data.catalog_config);
            const overrides = data.products_config ? JSON.parse(data.products_config) : [];

            // Only proceed if we have valid catalog items
            if (Array.isArray(catalog) && catalog.length > 0) {
              // Extract unique categories
              const uniqueCategories = [...new Set(catalog.map(item => item.category || 'General'))];

              // Build category objects
              const processedCategories = uniqueCategories.map(catName => {

                // Check for override in products_config by originalCategory OR title
                const override = overrides.find(p => (p.originalCategory === catName) || (p.title === catName));

                // Default Data from Catalog
                const catProducts = catalog.filter(p => (p.category || 'General') === catName);
                const firstImage = catProducts.find(p => p.imgSrc)?.imgSrc || "/assets/Concreto.png"; // Fallback image

                // Use override if exists, otherwise default
                if (override) {
                  return {
                    id: catName.toLowerCase().replace(/\s+/g, '-'),
                    title: override.title,
                    description: override.description,
                    imgSrc: override.imgSrc || firstImage,
                    originalCategory: catName
                  };
                }

                return {
                  id: catName.toLowerCase().replace(/\s+/g, '-'),
                  title: catName,
                  description: `Explora nuestra línea de ${catName}.`,
                  imgSrc: firstImage,
                  originalCategory: catName
                };
              });

              if (processedCategories.length > 0) {
                setCategories(processedCategories);
              }
            }
          } catch (e) { console.error("Error processing catalog config:", e); }
        }
      } catch (e) {
        console.error("Error fetching settings for Home Products:", e);
      }
    };

    fetchCatalog();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const next = prevIndex + 3;
      if (next >= categories.length) return 0; // Wrap to start
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const next = prevIndex - 3;
      if (next < 0) {
        // Wrap to last page
        const remainder = categories.length % 3;
        if (remainder === 0) return Math.max(0, categories.length - 3);
        return Math.max(0, categories.length - remainder);
      }
      return next;
    });
  };

  return (
    <section id="productos" className="py-12 relative group">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-10 text-center">Nuestros Productos Destacados</h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Arrows - Rendered inside container but pushed out slightly */}
        {categories.length > 3 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-dark-surface rounded-full shadow-lg text-brand-primary hover:bg-gray-100 transition border border-gray-100 md:-translate-x-4"
              aria-label="Anterior"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-dark-surface rounded-full shadow-lg text-brand-primary hover:bg-gray-100 transition border border-gray-100 md:translate-x-4"
              aria-label="Siguiente"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.slice(currentIndex, currentIndex + 3).map((category) => (
            <Link
              key={category.id}
              to={`/productos`} // Linking to general products page
              className="block h-full transition duration-300 hover:scale-[1.02]"
            >
              <ContentCard {...category} />
            </Link>
          ))}
          {/* If there are fewer than 3 items in the current slice, grid handles it reasonably well */}
        </div>
      </div>

      <div className="text-center mt-10">
        <Link
          to="/productos"
          className="inline-block bg-white text-brand-primary font-bold px-8 py-3 rounded-full text-lg border-2 border-brand-primary hover:bg-green-50 transition shadow-md dark:bg-dark-surface dark:text-gray-100 dark:border-brand-primary"
        >
          Ver Catálogo Completo
        </Link>
      </div>
    </section>
  );
};

export default ProductsSection;
