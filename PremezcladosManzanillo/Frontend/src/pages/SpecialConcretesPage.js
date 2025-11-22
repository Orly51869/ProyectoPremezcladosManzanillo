import React from 'react';
import { Link } from 'react-router-dom';
import { Download, LayoutDashboard, Droplet, Layers3 } from 'lucide-react';
import HomepageNavbar from '../components/HomepageNavbar';
import Footer from '../components/Footer';
import { productCategories, aditivosAdicionales } from '../mock/data';
import OtherCategoriesSection from '../sections/product/OtherCategoriesSection';
import ProductSubtypeCard from '../components/ProductSubtypeCard';

// Mapeo de iconos para la sección de Aditivos/Servicios
const iconMap = {
    'droplet': Droplet,
    'layers-3': Layers3,
    'default': LayoutDashboard
};

// Nuevo Componente para listar Aditivos/Servicios
const FeatureListItem = ({ item }) => {
    const IconComponent = iconMap[item.icon] || iconMap['default'];
    
    return (
        <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-secondary rounded-lg">
            <IconComponent size={24} className="text-brand-primary dark:text-green-400 flex-shrink-0 mt-1" />
            <div>
                <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
        </div>
    );
}

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                {category.products.map(product => (
                    <ProductSubtypeCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    </div>
);

// Componente para la sección de Aditivos y Servicios
const AdditionalSection = ({ data }) => (
    <div className="py-12 border-t border-gray-200 dark:border-gray-700 mt-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {data.title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {data.subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.items.map((item, index) => (
                <FeatureListItem key={index} item={item} />
            ))}
        </div>
    </div>
);

const SpecialConcretesPage = () => {
    const category = productCategories.find(cat => cat.id === 'especiales');

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
                    <AdditionalSection data={aditivosAdicionales} />
                    <OtherCategoriesSection currentCategoryId="especiales" />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SpecialConcretesPage;