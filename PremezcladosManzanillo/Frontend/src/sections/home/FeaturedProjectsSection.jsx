import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Building } from 'lucide-react';
import FeaturedProjectCard from '../../components/FeaturedProjectCard.jsx';
import { getProjects } from '../../utils/api';
import { Link } from 'react-router-dom';

// Función para dividir el array en chunks
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const FeaturedProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data.filter(p => p.active));
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Dividir proyectos en grupos de 3 (máximo)
  const projectChunks = chunk(projects.length > 0 ? projects : [], 3);

  const paginate = (newDirection) => {
    if (projectChunks.length <= 1) return;
    setDirection(newDirection);
    setIndex(prevIndex => (prevIndex + newDirection + projectChunks.length) % projectChunks.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '50%' : '-50%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '50%' : '-50%',
      opacity: 0,
    }),
  };

  if (loading) return null;

  return (
    <section id="proyectos-destacados" className="py-20 dark:bg-dark-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
            Nuestra Huella en la Región
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Descubre cómo hemos ayudado a construir el futuro de Colima.</p>
        </div>
        
        {projects.length > 0 ? (
          <div className="relative">
            <div className="relative h-auto md:h-[480px] overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={index}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 py-4"
                >
                  {projectChunks[index]?.map((project) => (
                    <FeaturedProjectCard 
                      key={project.id} 
                      title={project.title}
                      description={project.description}
                      imgSrc={project.imageUrl || '/assets/Hero.png'}
                      category={project.category}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {projectChunks.length > 1 && (
                <div className="hidden md:block">
                  <button
                    onClick={() => paginate(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-3 rounded-full bg-white dark:bg-dark-primary text-gray-800 dark:text-white shadow-xl hover:bg-brand-primary hover:text-white transition-all transform hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => paginate(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-3 rounded-full bg-white dark:bg-dark-primary text-gray-800 dark:text-white shadow-xl hover:bg-brand-primary hover:text-white transition-all transform hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            {/* Dots navigation */}
            {projectChunks.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {projectChunks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                        setDirection(i > index ? 1 : -1);
                        setIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-brand-primary' : 'w-2 bg-gray-300 dark:bg-gray-700'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 opacity-50">
             <Building className="mx-auto w-12 h-12 text-gray-400 mb-2" />
             <p className="text-gray-500">Pronto verás nuestros proyectos aquí.</p>
          </div>
        )}

        <div className="flex justify-center mt-12">
          <Link to="/proyectos">
            <button className="group px-8 py-3 bg-white dark:bg-dark-surface text-brand-primary font-bold rounded-full text-lg border-2 border-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-md flex items-center gap-2">
              Ver Todas las Obras
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjectsSection;