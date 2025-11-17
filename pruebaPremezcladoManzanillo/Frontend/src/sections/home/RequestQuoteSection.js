import React from 'react';
import { Link } from 'react-router-dom';

const RequestQuoteSection = () => {
  return (
    <section id="cotizacion" className="w-full bg-green-50 py-16 mt-16 rounded-lg shadow-inner">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-green-800 mb-4">
          ¿Listo para tu próximo proyecto?
        </h2>
        <p className="text-xl text-green-700 mb-8">
          Solicita una cotización hoy y recibe una respuesta en menos de 24 horas.
        </p>
        <Link 
          to="/contacto"
          className="inline-block px-10 py-4 bg-green-700 text-white font-bold rounded-full text-xl hover:bg-green-800 transition shadow-lg transform hover:scale-105"
        >
          Solicitar Cotización
        </Link>
      </div>
    </section>
  );
};

export default RequestQuoteSection;