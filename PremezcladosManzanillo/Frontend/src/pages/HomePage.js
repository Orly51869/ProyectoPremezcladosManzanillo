/*************************************/
/**            Homepage             **/
/*************************************/
// Archivo para renderizar la página de inicio

// Librerías y módulos 
import React from "react";
import HomepageNavbar from "../components/HomepageNavbar";
import HeroSection from "../sections/home/HeroSection";
import ProductsSection from "../sections/home/ProductsSection";
import ServicesSection from "../sections/home/ServicesSection";
import FeaturedProjectsSection from "../sections/home/FeaturedProjectsSection";
import Footer from "../components/Footer";

// Componente principal
export const HomePage = () => {
  return (
    /* Contenedor principal */
    <div className="relative min-h-screen bg-white dark:bg-dark-primary">
      <HomepageNavbar />
      <main className="w-full pt-32 md:pt-36"> {/* Offset para menú fijo */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-8 mx-16">
                <HeroSection />
            </div>
            <div className="mt-20">
                <ProductsSection />
            </div>
            <div className="mt-20">
                <ServicesSection />
            </div>
            <div className="mt-10">
                <FeaturedProjectsSection />
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
