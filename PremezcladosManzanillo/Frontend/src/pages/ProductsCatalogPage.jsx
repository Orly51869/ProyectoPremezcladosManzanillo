import React, { useState, useEffect } from 'react';
import HomepageNavbar from '../components/HomepageNavbar.jsx';
import Footer from '../components/Footer.jsx';
import ProductSubtypeCard from '../components/ProductSubtypeCard.jsx';
import api from '../utils/api';
import { productCategories } from '../mock/data';

const ProductsCatalogPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const { data } = await api.get('/api/settings');
                if (data.catalog_config && JSON.parse(data.catalog_config).length > 0) {
                    const rawCatalog = JSON.parse(data.catalog_config);

                    // Group by category
                    const grouped = rawCatalog.reduce((acc, product) => {
                        const catName = product.category || 'General';
                        if (!acc[catName]) {
                            acc[catName] = [];
                        }
                        acc[catName].push(product);
                        return acc;
                    }, {});

                    // Transform to array for rendering
                    const categoriesArray = Object.entries(grouped).map(([title, products], index) => ({
                        id: index,
                        title: title,
                        products: products
                    }));

                    setCategories(categoriesArray);
                } else {
                    setCategories(productCategories);
                }
            } catch (error) {
                console.error("Error loading catalog:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCatalog();
    }, []);

    return (
        <div className="relative min-h-screen bg-white dark:bg-dark-primary">
            <HomepageNavbar />

            {/* Encabezado General del Catálogo */}
            <header className="pt-32 md:pt-40 lg:pt-44 pb-12 dark:bg-dark-secondary text-center min-h-[160px]">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 whitespace-normal leading-tight max-w-4xl mx-auto">
                    Catálogo de productos
                </h1>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Cargando catálogo...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No hay productos disponibles en el catálogo.</div>
                ) : (
                    categories.map(category => (
                        <div key={category.id} className="mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center uppercase tracking-wider">
                                {category.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {category.products.map((product, idx) => (
                                    <ProductSubtypeCard key={idx} product={product} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            <Footer />
        </div>
    );
};

export default ProductsCatalogPage;
