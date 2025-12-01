
import React from 'react';
import HomepageNavbar from '../components/HomepageNavbar.jsx';
import Footer from '../components/Footer.jsx';

// Datos de los servicios
const services = [
    {
        title: 'Asesoría Técnica Personalizada',
        description: 'Ofrecemos un acompañamiento completo desde la concepción de tu proyecto. Nuestro equipo de expertos te ayuda a seleccionar el tipo de concreto ideal según tus necesidades estructurales, las condiciones del sitio y tu presupuesto, garantizando la máxima eficiencia y durabilidad.',
        imageSrc: '/assets/Asesoria.png',
        imageAlt: 'Ingenieros revisando planos de construcción',
    },
    {
        title: 'Soluciones en Cada Entrega',
        description: 'No solo entregamos concreto; entregamos tranquilidad. Cada envío es supervisado para cumplir con los más altos estándares de calidad y puntualidad. Coordinamos la logística para adaptarnos al ritmo de tu obra, asegurando que el material llegue en el momento y lugar precisos.',
        imageSrc: '/assets/Entrega.png',
        imageAlt: 'Camión de premezclado en una obra',
    },
    {
        title: 'Servicio de Bomba de Concreto',
        description: 'Facilitamos la colocación del concreto en lugares de difícil acceso, como edificios de gran altura o estructuras complejas. Nuestro servicio de bombeo es seguro, rápido y reduce la necesidad de mano de obra, optimizando el tiempo y los costos de tu proyecto.',
        imageSrc: '/assets/Bombeo.png',
        imageAlt: 'Bombeo de concreto en una losa de edificio',
    },
];

// Componente para una sección de servicio individual
const ServiceSection = ({ service, reverseLayout }) => (
    <div className={`flex flex-col ${reverseLayout ? 'md:flex-row-reverse' : 'md:flex-row'} items-center bg-white shadow-lg rounded-lg overflow-hidden mb-12`}>
        <div className="w-full md:w-1/2">
            <img src={service.imageSrc} alt={service.imageAlt} className="w-full h-64 md:h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
            <p className="text-gray-700">
                {service.description}
            </p>
        </div>
    </div>
);


const ServicesPage = () => {
    return (
        <div className="relative min-h-screen dark:bg-dark-primary">
            <HomepageNavbar />
            <main className="pt-24 pb-16">
                {/* Encabezado de la página */}
                <div className="relative h-96 flex items-center justify-center text-white mb-16 shadow-xl overflow-hidden">
                    <img 
                        src="/assets/Carretera.png" 
                        alt="Fondo de servicios de construcción"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                    <div className="relative z-10 text-center px-4">
                        <h1 className="text-5xl font-extrabold tracking-tight text-white">
                            Nuestros Servicios
                        </h1>
                        <p className="mt-4 text-xl font-medium">
                            Soluciones integrales para llevar tu proyecto al siguiente nivel.
                        </p>
                    </div>
                </div>

                {/* Contenido de los servicios */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {services.map((service, index) => (
                        <ServiceSection key={index} service={service} reverseLayout={index % 2 !== 0} />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ServicesPage;
