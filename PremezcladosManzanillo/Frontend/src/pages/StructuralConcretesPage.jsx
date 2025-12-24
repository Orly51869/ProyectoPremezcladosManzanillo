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

const StructuralConcretesPage = () => {
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
                // Fallback to mock data on error by not setting global error state
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const structuralCategory = useMemo(() => {
        const structuralProducts = allProducts.filter(p =>
            p.category === 'Estructural' ||
            (p.category && typeof p.category === 'object' && p.category.name === 'Estructural')
        );

        // Fallback al mock data si no hay productos en la DB aún
        const displayProducts = structuralProducts.length > 0
            ? structuralProducts.map(p => ({
                id: p.id,
                title: p.name,
                description: p.description,
                f_c: p.resistance,
                imageSrc: p.image || '/assets/Concreto.png'
            }))
            : [
                { id: 'c-100', title: 'Concreto 100 kg/cm²', description: 'Ideal para obras livianas o no estructurales.', f_c: '100 kg/cm²', imageSrc: '/assets/Concreto.png' },
                { id: 'c-120', title: 'Concreto 120 kg/cm²', description: 'Para cimentaciones o pisos de baja carga.', f_c: '120 kg/cm²', imageSrc: '/assets/Concreto.png' },
                { id: 'c-150', title: 'Concreto 150 kg/cm²', description: 'Recomendado para estructuras ligeras o muros.', f_c: '150 kg/cm²', imageSrc: '/assets/Concreto.png' },
                { id: 'c-210', title: 'Concreto 210 kg/cm²', description: 'Uso general en estructuras residenciales y comerciales.', f_c: '210 kg/cm²', imageSrc: '/assets/Concreto.png' },
                { id: 'c-250', title: 'Concreto 250 kg/cm²', description: 'Excelente equilibrio entre resistencia y trabajabilidad.', f_c: '250 kg/cm²', imageSrc: '/assets/Concreto.png' },
                { id: 'c-280', title: 'Concreto 280 kg/cm²', description: 'Ideal para estructuras de mayor exigencia.', f_c: '280 kg/cm²', imageSrc: '/assets/Concreto.png' },
                { id: 'c-300', title: 'Concreto 300 kg/cm²', description: 'Para proyectos industriales o de alta carga.', f_c: '300 kg/cm²', imageSrc: '/assets/Concreto.png' },
                { id: 'c-350', title: 'Concreto 350 kg/cm²', description: 'Máxima resistencia para aplicaciones especiales.', f_c: '350 kg/cm²', imageSrc: '/assets/Concreto.png' },
            ];

        return {
            id: 'estructurales',
            title: 'Concretos Estructurales',
            subtitle: 'Desarrollados para ofrecer alta resistencia y desempeño confiable en elementos como columnas, vigas, losas y fundaciones.',
            description: 'Disponibles en diferentes grados según las exigencias del proyecto. (Disponible con asentamiento normal 5” o con bomba 7”, según el método de colocación requerido).',
            heroImageSrc: '/assets/Concreto.png',
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

    if (!structuralCategory) {
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
                <CategorySection category={structuralCategory} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <OtherCategoriesSection currentCategoryId="estructurales" />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default StructuralConcretesPage;