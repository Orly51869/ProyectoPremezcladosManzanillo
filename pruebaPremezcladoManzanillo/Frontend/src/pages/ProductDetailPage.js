import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import HomepageNavbar from '../components/HomepageNavbar'; 
import Footer from '../components/Footer'; 
import ProductDetailContent from '../sections/product/ProductDetailContent';
import { mockProducts } from '../mock/data';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulación de fetch de datos
        setIsLoading(true);
        const data = mockProducts[productId];
        setTimeout(() => {
            setProduct(data);
            setIsLoading(false);
        }, 300); // Pequeño delay simulado
    }, [productId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-primary flex items-center justify-center">
                <p className="text-xl dark:text-gray-200">Cargando detalles del producto...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark-primary pt-16">
                <HomepageNavbar />
                <div className="max-w-7xl mx-auto py-12 px-4 text-center">
                    <h1 className="text-3xl font-bold text-red-500 dark:text-red-400">Producto No Encontrado</h1>
                    <Link to="/" className="mt-4 text-brand-primary dark:text-green-400 hover:underline">
                        Volver al Inicio
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }
    
    return (
        <div className="relative min-h-screen bg-white dark:bg-dark-primary">
            <HomepageNavbar />
            
            <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProductDetailContent product={product} />
            </main>
            
            <Footer />
        </div>
    );
};

export default ProductDetailPage;