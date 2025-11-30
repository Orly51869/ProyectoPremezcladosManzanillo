import React from 'react';
import { Link } from 'react-router-dom';
import { productCategories } from '../../mock/data';
import ContentCard from '../../components/ContentCard.jsx';

const OtherCategoriesSection = ({ currentCategoryId }) => {
    const otherCategories = productCategories.filter(cat => cat.id !== currentCategoryId);

    if (otherCategories.length === 0) {
        return null;
    }

    return (
        <div className="py-12 border-t border-gray-200 dark:border-gray-700 mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                Otras Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {otherCategories.map(category => (
                    <Link 
                        key={category.id} 
                        to={`/productos/${category.id}`}
                        className="block h-full transition duration-300 hover:scale-[1.02]"
                    >
                        <ContentCard 
                            title={category.title}
                            description={category.subtitle} // Using subtitle as description for the card
                            imgSrc={category.heroImageSrc} // Using heroImageSrc as imgSrc
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default OtherCategoriesSection;
