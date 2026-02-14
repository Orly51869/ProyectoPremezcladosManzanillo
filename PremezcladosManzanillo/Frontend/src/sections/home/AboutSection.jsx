import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AboutSection = () => {
    const [config, setConfig] = useState({
        title: "Sobre Nosotros",
        description: "Somos una empresa comprometida con la calidad y el servicio. Ofrecemos soluciones integrales para tus proyectos de construcción, garantizando siempre los mejores resultados y la satisfacción de nuestros clientes.",
        imgSrc: "/assets/Toma frontal Planta.jpeg", // Imagen por defecto
        buttonText: "Conoce Más"
    });

    useEffect(() => {
        const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001';
        fetch(`${API_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.about_home_config) {
                    try {
                        setConfig(JSON.parse(data.about_home_config));
                    } catch (e) {
                        console.error("Error parsing about_home_config", e);
                    }
                }
            })
            .catch(err => console.error("Error fetching settings:", err));
    }, []);

    return (
        <section className="py-20 bg-gray-50 dark:bg-dark-surface/50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Contenido de Texto */}
                    <div className="order-2 lg:order-1 space-y-6">
                        <span className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-bold uppercase tracking-wider rounded-full">
                            Nuestra Historia
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                            {config.title}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {config.description}
                        </p>
                        <div className="pt-4">
                            <Link
                                to="/nosotros"
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-brand-primary hover:bg-green-700 transition shadow-lg hover:shadow-xl"
                            >
                                {config.buttonText || "Conoce Más"}
                            </Link>
                        </div>
                    </div>

                    {/* Contenido de Imagen */}
                    <div className="order-1 lg:order-2 relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] group">
                            <div className="absolute inset-0 bg-brand-primary/20 mix-blend-multiply group-hover:bg-transparent transition duration-500"></div>
                            <img
                                src={config.imgSrc}
                                alt="Sobre Nosotros"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                            />
                        </div>
                        {/* Elemento decorativo */}
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-brand-secondary rounded-full blur-2xl opacity-50 z-[-1]"></div>
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-primary rounded-full blur-3xl opacity-30 z-[-1]"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
