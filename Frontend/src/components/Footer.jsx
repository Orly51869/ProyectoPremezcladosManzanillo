import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white dark:bg-dark-primary border-t border-gray-200 dark:border-gray-700 py-8">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-200 dark:border-gray-700">

                    {/* Sección 1: Empresa */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center mb-4">
                            <img
                                src={"/assets/LOGO_PREMEZCLADOS.svg"}
                                alt="Logo Premezclados"
                                className="h-12 w-auto mr-2"
                            />
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Premezclado Manzanillo, C.A.</span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Concreto de calidad para tus proyectos.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Innovación y resistencia en cada mezcla.
                        </p>
                    </div>

                    {/* Sección 2: Contacto */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contacto</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4 mr-2 text-brand-primary" />
                                Av. 31 de Julio, Sector Guatamare. Edo. Nueva Esparta. Venezuela.
                            </li>
                            <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4 mr-2 text-brand-primary" />
                                0295 – 2871422
                            </li>
                            <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4 mr-2 text-brand-primary" />
                                premezmanzanilloca@gmail.com
                            </li>
                        </ul>
                    </div>

                    {/* Sección 3: Clientes */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Clientes</h3>
                        <ul className="space-y-2">
                            <li><Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">Acceso a Clientes</Link></li>
                            <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">Preguntas Frecuentes</a></li>
                            <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">Términos y Condiciones</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Copyright and Social Icons */}
                <div className="flex flex-col sm:flex-row justify-center items-center pt-6 gap-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
                        © {currentYear} Premezclados Manzanillo. Todos los derechos reservados.
                    </p>
                    <div className="flex">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 dark:text-gray-400 hover:text-brand-primary transition">
                            <Instagram className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;