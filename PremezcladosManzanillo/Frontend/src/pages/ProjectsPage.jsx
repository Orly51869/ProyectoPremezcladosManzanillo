import React from 'react';
import HomepageNavbar from '../components/HomepageNavbar.jsx';
import Footer from '../components/Footer.jsx';
import { Building } from 'lucide-react';
import { mockProjects } from '../mock/data'; // Importar los proyectos

const ProjectsPage = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-dark-primary">
      <HomepageNavbar />
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Nuestros Proyectos
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Desde grandes obras de infraestructura hasta edificaciones comerciales y residenciales, nuestro concreto es la base de los proyectos más importantes de la región.
            </p>
          </div>

          {/* Grid de Proyectos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProjects.map((project, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
                <img src={project.imgSrc} alt={project.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <p className="text-sm font-semibold text-green-600 mb-1">{project.category}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-700 text-sm">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Placeholder para más proyectos */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-gray-100 p-6 rounded-lg">
                <Building className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-600">
                    Más proyectos emblemáticos serán añadidos próximamente.
                </p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;