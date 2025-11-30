import React from 'react';
import { Link } from 'react-router-dom';
import HomepageNavbar from '../components/HomepageNavbar.jsx';
import Footer from '../components/Footer.jsx';
import { productCategories } from '../mock/data';
import ProductSubtypeCard from '../components/ProductSubtypeCard.jsx'; // Import ProductSubtypeCard

const ProductsCatalogPage = () => {
    return (
        <div className="relative min-h-screen bg-white dark:bg-dark-primary">
            <HomepageNavbar />

            {/* Encabezado General del Catálogo */}
            <header className="pt-24 pb-12 bg-gray-50 dark:bg-dark-secondary text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
                    Catálogo Completo de Productos
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Explora nuestra gama completa de soluciones de concreto premezclado y especializados.
                </p>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {productCategories.map(category => (
                    <div key={category.id} className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                            {category.title}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {category.products.map(product => (
                                <ProductSubtypeCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                ))}
            </main>

            <Footer />
        </div>
    );
};

export default ProductsCatalogPage;
