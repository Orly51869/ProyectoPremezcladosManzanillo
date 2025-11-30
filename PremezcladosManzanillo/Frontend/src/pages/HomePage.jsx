/*************************************/
/**            Homepage             **/
/*************************************/
// Archivo para renderizar la página de inicio

// Librerías y módulos 
import React from "react";
import HomepageNavbar from "../components/HomepageNavbar.jsx";
import HeroSection from "../sections/home/HeroSection.jsx";
import ProductsSection from "../sections/home/ProductsSection.jsx";
import ServicesSection from "../sections/home/ServicesSection.jsx";
import FeaturedProjectsSection from "../sections/home/FeaturedProjectsSection.jsx";
import Footer from "../components/Footer.jsx";


// Componente principal
export const HomePage = () => {
  return (
    /* Contenedor principal */
    <div className="relative min-h-screen bg-white dark:bg-dark-primary">
      <HomepageNavbar />
      <main className="w-full pt-32 md:pt-36"> {/* Offset para menú fijo */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroSection />
            <ProductsSection />
            <ServicesSection />

            <FeaturedProjectsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
