import React, { useEffect, useState } from 'react';
import HomepageNavbar from '../components/HomepageNavbar.jsx';
import Footer from '../components/Footer.jsx';
import { Building, MapPin, Tag } from 'lucide-react';
import { getProjects } from '../utils/api';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data.filter(p => p.active));
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="relative min-h-screen dark:bg-dark-primary">
      <HomepageNavbar />
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Nuestros Proyectos
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Desde grandes obras de infraestructura hasta edificaciones comerciales y residenciales, nuestro concreto es la base de los proyectos más importantes de la región.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
          ) : projects.length > 0 ? (
            /* Grid de Proyectos */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="h-56 relative overflow-hidden">
                    <img 
                      src={project.imageUrl || '/assets/Hero.png'} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded-full shadow-lg">
                        {project.category || 'Proyecto'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center text-gray-500 dark:text-gray-500 text-xs">
                        <MapPin size={14} className="mr-1" />
                        {project.location || 'Venezuela'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium bg-gray-50 dark:bg-dark-primary px-2 py-0.5 rounded">
                        {project.date || 'Reciente'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20">
              <div className="inline-block bg-gray-50 dark:bg-dark-surface p-10 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                      Estamos preparando nuevos proyectos emblemáticos.
                  </p>
                  <p className="text-gray-400 text-sm">Próximamente verás más de nuestras obras terminadas aquí.</p>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;