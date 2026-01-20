import React from 'react';
import { Link } from 'react-router-dom';
import { Download, LayoutDashboard } from 'lucide-react';

const ProductSubtypeCard = ({ product }) => {
    return (
        <div className="relative bg-white dark:bg-dark-surface rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-dark-surface">
            {(product.imgSrc || product.imageSrc) && (
                <img
                    src={product.imgSrc || product.imageSrc}
                    alt={product.title}
                    className="w-full h-40 object-cover"
                />
            )}

            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{product.title}</h3>
                {product.f_c && (
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">f'c = {product.f_c}</p>
                )}
                <p className="text-gray-600 dark:text-gray-300 text-sm">{product.description}</p>
            </div>

            <div className="flex justify-center space-x-3 mt-4 p-4">
                <a
                    href={`/assets/data/ficha-tecnica-${product.id}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm border border-brand-primary dark:border-green-400 text-brand-primary dark:text-green-400 px-3 py-2 rounded-full hover:bg-brand-primary hover:text-white dark:hover:bg-green-600 dark:hover:text-white transition"
                >
                    <Download size={16} />
                    <span>Ficha Técnica</span>
                </a>
            </div>
        </div>
    );
};

export default ProductSubtypeCard;
