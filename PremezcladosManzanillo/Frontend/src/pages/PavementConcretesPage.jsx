import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HomepageNavbar from '../components/HomepageNavbar.jsx';
import Footer from '../components/Footer.jsx';
// import { productCategories } from '../mock/data'; // Remove mock data import
import OtherCategoriesSection from '../sections/product/OtherCategoriesSection.jsx';
import ProductSubtypeCard from '../components/ProductSubtypeCard.jsx';
import api from '../utils/api'; // Import the api utility

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

        {/* Hero Image Section - Centered */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div
                className="w-full bg-cover bg-center rounded-2xl shadow-lg"
                style={{
                    height: '400px',
                    backgroundImage: `url(${category.heroImageSrc || "/assets/HERO.png"})`
                }}
            />
        </div>

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
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/api/products');
                setAllProducts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                // Fallback to mock data on error
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const pavementCategory = useMemo(() => {
        const pavementProducts = allProducts.filter(p =>
            p.category === 'Pavimento' ||
            (p.category && typeof p.category === 'object' && p.category.name === 'Pavimento')
        );

        const displayProducts = pavementProducts.length > 0
            ? pavementProducts.map(p => ({
                id: p.id,
                title: p.name,
                description: p.description,
                f_c: p.resistance,
                imageSrc: p.image || '/assets/Carretera.png'
            }))
            : [
                { id: 'pavi-vial-40', title: 'PAVI-VIAL 40', description: 'Pavimentos de tráfico ligero.', f_c: null, imageSrc: '/assets/Carretera.png' },
                { id: 'pavi-vial-45', title: 'PAVI-VIAL 45', description: 'Calles urbanas o estacionamientos.', f_c: null, imageSrc: '/assets/Carretera.png' },
                { id: 'pavi-vial-50', title: 'PAVI-VIAL 50', description: 'Vías de tráfico medio o pesado.', f_c: null, imageSrc: '/assets/Carretera.png' },
                { id: 'pavi-vial-50-ft', title: 'PAVI-VIAL 50 FT', description: 'Pavimentos de alta resistencia con aditivos especiales.', f_c: null, imageSrc: '/assets/Carretera.png' },
            ];

        return {
            id: 'pavimentos',
            title: 'Concretos para Pavimentos',
            subtitle: 'Diseñados para soportar tránsito vehicular y ofrecer una superficie durable y uniforme.',
            description: 'Recomendados para calles, avenidas, patios de maniobra y zonas industriales.',
            heroImageSrc: '/assets/Concreto-Pavimento.png',
            products: displayProducts,
        };
    }, [allProducts]);



    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-primary pt-16">
                <HomepageNavbar />
                <div className="max-w-7xl mx-auto py-12 px-4 text-center">
                    <h1 className="text-3xl font-bold text-red-500 dark:text-red-400">Error: {error}</h1>
                    <Link to="/productos" className="mt-4 text-brand-primary dark:text-green-400 hover:underline">
                        Volver al Catálogo
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    if (!pavementCategory) {
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
                <CategorySection category={pavementCategory} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <OtherCategoriesSection currentCategoryId="pavimentos" />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PavementConcretesPage;