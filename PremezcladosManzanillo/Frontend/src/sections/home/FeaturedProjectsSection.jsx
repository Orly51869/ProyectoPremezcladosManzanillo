import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FeaturedProjectCard from '../../components/FeaturedProjectCard.jsx';
import { mockProjects } from '../../mock/data'; // Importar los proyectos
import { Link } from 'react-router-dom';

// Función para dividir el array en chunks
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const FeaturedProjectsSection = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Dividir proyectos en grupos de 3
  const projectChunks = chunk(mockProjects, 3);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setIndex(prevIndex => (prevIndex + newDirection + projectChunks.length) % projectChunks.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <section id="proyectos-destacados" className="py-16 bg-gray-50 dark:bg-dark-surface overflow-hidden">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-10 text-center">
        Proyectos Destacados de la Región
      </h2>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="relative h-[450px] overflow-hidden rounded-2xl bg-white dark:bg-dark-green-darker border border-gray-200/70 dark:border-white/10 shadow-lg">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 260, damping: 32 },
                opacity: { duration: 0.25 }
              }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-10 py-6 items-center"
            >
              {projectChunks[index]?.map((project) => (
                <FeaturedProjectCard key={project.title} {...project} />
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0">
            <button
              onClick={() => paginate(-1)}
              className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white shadow-lg hover:bg-white/50 transition"
              aria-label="Proyecto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/30 backdrop-blur-md text-white shadow-lg hover:bg-white/50 transition"
              aria-label="Siguiente proyecto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <Link to="/proyectos">
          <button className="px-8 py-3 bg-white text-brand-primary font-bold rounded-full text-lg border-2 border-brand-primary hover:bg-green-50 transition shadow-md dark:bg-dark-surface dark:text-gray-100 dark:border-brand-primary">
            Ver Galería Completa
          </button>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProjectsSection;