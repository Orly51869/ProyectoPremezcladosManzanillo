import React from 'react';
import { Link } from 'react-router-dom';
import HomepageNavbar from '../components/HomepageNavbar';
import Footer from '../components/Footer';
import { productCategories } from '../mock/data';
import ProductSubtypeCard from '../components/ProductSubtypeCard'; // Import ProductSubtypeCard

const ProductsCatalogPage = () => {
    return (
        <div className="relative min-h-screen bg-white dark:bg-dark-primary">
            <HomepageNavbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16">
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
