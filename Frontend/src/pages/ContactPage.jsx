import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import HomepageNavbar from '../components/HomepageNavbar';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactPage = () => {
    const [state, handleSubmit] = useForm("xldozadq");

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-dark-primary">
            <HomepageNavbar />
            <main className="pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Encabezado */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Contáctanos
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-white max-w-2xl mx-auto">
                            Estamos aquí para ayudarte. Envíanos un mensaje o utiliza nuestros datos de contacto directo.
                        </p>
                    </div>

                    {/* Contenedor principal: Grid de 2 columnas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* Columna Izquierda: Formulario */}
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>
                            {state.succeeded ? (
                                <div className="text-center py-10 px-6 bg-green-100 rounded-lg">
                                    <h3 className="text-2xl font-bold text-green-800">¡Gracias por tu mensaje!</h3>
                                    <p className="mt-3 text-gray-700">Nos pondremos en contacto contigo pronto.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                        <input id="name" type="text" name="name" required className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                                        <ValidationError prefix="Name" field="name" errors={state.errors} className="mt-2 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                        <input id="email" type="email" name="email" required className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                                        <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-2 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Asunto</label>
                                        <select id="subject" name="subject" required className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                                            <option>Solicitar una Cotización</option>
                                            <option>Asesoría Técnica</option>
                                            <option>Información General</option>
                                            <option>Otro</option>
                                        </select>
                                        <ValidationError prefix="Subject" field="subject" errors={state.errors} className="mt-2 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                                        <textarea id="message" name="message" rows="4" required className="mt-1 block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
                                        <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-2 text-sm text-red-600" />
                                    </div>
                                    <div className="text-right">
                                        <button type="submit" disabled={state.submitting} className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                            Enviar Mensaje
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Columna Derecha: Datos de Contacto y Mapa */}
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-lg shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">PREMEZCLADOS MANZANILLO, C.A</h3>
                                <p className="text-gray-700 mb-4">RIF: J-29762187-3</p>
                                <ul className="space-y-4 text-gray-700">
                                    <li className="flex items-center">
                                        <MapPin className="w-6 h-6 mr-3 text-green-600" />
                                        <span>Av. 31 de Julio, Sector Guatamare. Edo. Nueva Esparta. Venezuela.</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Phone className="w-6 h-6 mr-3 text-green-600" />
                                        <span>0295 – 2871422</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Mail className="w-6 h-6 mr-3 text-green-600" />
                                        <a href="mailto:premezmanzanilloca@gmail.com" className="hover:underline">premezmanzanilloca@gmail.com</a>
                                    </li>
                                    <li className="flex items-center">
                                        <Clock className="w-6 h-6 mr-3 text-green-600" />
                                        <span>Lunes a Viernes: 8:00 AM - 5:00 PM</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-white h-64 md:h-80 rounded-lg shadow-lg overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.1439632329923!2d-63.84625862424858!3d11.02685885449495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c318c4491848061%3A0x87374a63840365c2!2sEdificio%20Don%20Guillermo!5e0!3m2!1ses-419!2sve!4v1725230512887!5m2!1ses-419!2sve"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Ubicación de Premezclado Manzanillo"
                                ></iframe>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactPage;