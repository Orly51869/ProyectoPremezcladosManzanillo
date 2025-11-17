import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductDetailContent = ({ product }) => {
    return (
        <div className="py-12 lg:py-16">
            
            {/* Sección 1: Cabecera con Imagen y Texto */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-12 border-b border-gray-200 dark:border-gray-700">
                
                {/* Texto y Llamado a la Acción (Columnas 1-6) */}
                <div className="lg:col-span-7">
                    <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
                        {product.title}
                    </h1>
                    <p className="text-xl font-medium text-brand-primary dark:text-green-400 mb-6">
                        {product.subtitle}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        {product.description}
                    </p>
                    
                    {/* Botones de Acción */}
                    <div className="flex space-x-4">
                        <Link to="/cotizaciones" className="bg-brand-primary text-white px-6 py-3 rounded-xl hover:bg-brand-mid transition duration-150">
                            Solicitar Cotización
                        </Link>
                        {/* Asumimos que la ficha técnica existe en /assets/data/ficha-tecnica-[id].pdf */}
                        <a href={`/assets/data/ficha-tecnica-${product.id}.pdf`} target="_blank" rel="noopener noreferrer" className="border border-brand-primary text-brand-primary dark:border-green-400 dark:text-green-400 px-6 py-3 rounded-xl hover:bg-brand-primary hover:text-white transition duration-150">
                            Descargar Ficha Técnica
                        </a>
                    </div>
                </div>
                
                {/* Imagen (Columnas 7-12) */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                    <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                        {/*  */}
                        <img src={product.imageSrc} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Sección 2: Beneficios/Características */}
            <div className="pt-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                    Beneficios Clave
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {product.benefits && product.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                            <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sección 3: Productos Relacionados */}
            <div className="pt-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                    Otros productos que se adaptan a tus necesidades
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {product.relatedProducts && product.relatedProducts.map(rel => (
                        <Link key={rel.id} to={`/productos/${rel.id}`} className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition duration-200 dark:hover:border-green-400">
                            <h3 className="text-lg font-semibold text-brand-primary dark:text-green-400">{rel.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ver detalles del producto.</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailContent;