import React from 'react';
import { Link } from 'react-router-dom';
import HomepageNavbar from '../components/HomepageNavbar';
import Footer from '../components/Footer';
import { productCategories } from '../mock/data';
import OtherCategoriesSection from '../sections/product/OtherCategoriesSection';
import ProductSubtypeCard from '../components/ProductSubtypeCard';

// Componente para una Sección de Categoría completa
const CategorySection = ({ category }) => (
    <div className="mb-16">
        {/* Title Section - Full Width */}
        <div className="bg-white dark:bg-dark-surface shadow-md">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                    {category.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    {category.subtitle}
                </p>
            </div>
        </div>

        {/* Hero Image Section - Full Width */}
        <div
            className="w-full bg-cover bg-center"
            style={{ 
                height: '400px',
                backgroundImage: `url(${category.heroImageSrc || "/assets/HERO.png"})` 
            }}
        />

        {/* Content Section - Constrained Width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <p className="text-center text-gray-700 dark:text-gray-300 mb-10 italic max-w-4xl mx-auto">
                {category.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {category.products.map(product => (
                    <ProductSubtypeCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    </div>
);

const PavementConcretesPage = () => {
    const category = productCategories.find(cat => cat.id === 'pavimentos');

    if (!category) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-primary pt-16">
                <HomepageNavbar />
                <div className="max-w-7xl mx-auto py-12 px-4 text-center">
                    <h1 className="text-3xl font-bold text-red-500 dark:text-red-400">Categoría no encontrada</h1>
                    <Link to="/productos" className="mt-4 text-brand-primary dark:text-green-400 hover:underline">
                        Volver al Catálogo
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-white dark:bg-dark-primary">
            <HomepageNavbar />
            <main className="pt-32 pb-16">
                <CategorySection category={category} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <OtherCategoriesSection currentCategoryId="pavimentos" />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PavementConcretesPage;
