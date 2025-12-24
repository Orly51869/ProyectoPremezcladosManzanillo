import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Layout, Save, Plus, Trash2, RefreshCcw } from 'lucide-react';
import api from '../utils/api';
import { useSettings } from '../context/SettingsContext';

const CustomizationPage = () => {
  const { settings, updateSetting: updateGlobalSetting } = useSettings();
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // States for configs
  const [heroConfig, setHeroConfig] = useState({ 
    images: [
      '/assets/Hero.png',
      '/assets/Toma frontal Planta.jpeg',
      '/assets/Toma araña Planta.jpeg',
      '/assets/Toma aerea Planta.jpeg'
    ], 
    texts: [
      "Calidad y resistencia para los proyectos que construyen nuestro futuro.",
      "Tu obra, nuestra prioridad. Concreto premezclado entregado a tiempo.",
      "Innovación en cada mezcla. Soluciones de concreto para desafíos modernos.",
      "Construye con confianza. La base de tu proyecto comienza con nosotros."
    ] 
  });

  const [productsConfig, setProductsConfig] = useState([
    { id: 'estructurales', title: "Concretos Estructurales", description: "Mezclas de alta resistencia para cimentaciones, columnas y losas.", imgSrc: "/assets/Concreto.png" },
    { id: 'pavimentos', title: "Concretos para Pavimentos", description: "Diseñados para soportar cargas dinámicas en vialidades y patios de maniobra.", imgSrc: "/assets/Concreto-Pavimento.png" },
    { id: 'especiales', title: "Concretos Especiales", description: "Rellenos fluidos y mezclas autocompactables para aplicaciones específicas.", imgSrc: "/assets/Edificio.png" }
  ]);

  const [servicesConfig, setServicesConfig] = useState([
    { title: "Servicio de Bombeo", description: "Llegamos a cualquier altura.", imgSrc: "/assets/Bombeo.png" },
    { title: "Asesoría Técnica", description: "Expertos te guían en tu proyecto.", imgSrc: "/assets/Asesoria.png" },
    { title: "Entrega Express", description: "Garantizamos tu concreto a tiempo.", imgSrc: "/assets/Entrega.png" }
  ]);

  // Projects (Portfolio) State
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    location: '',
    category: '',
    date: '', // Nuevo campo para año o fecha
    active: true
  });

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/settings');
      if (data.hero_config) setHeroConfig(JSON.parse(data.hero_config));
      if (data.products_config) setProductsConfig(JSON.parse(data.products_config));
      if (data.services_config) setServicesConfig(JSON.parse(data.services_config));
      
      const projectsData = await api.get('/api/projects');
      setProjects(projectsData.data);
    } catch (error) {
      console.error("Error fetching settings", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key, value) => {
    try {
      setSaving(true);
      await api.post('/api/settings', { key, value: JSON.stringify(value), type: 'json' });
      setMessage({ type: 'success', text: 'Cambios guardados correctamente.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  // Helper para subir archivos al servidor
  const handleFileUpload = async (file) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append('asset', file);
      const { data } = await api.post('/api/settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.url;
    } catch (error) {
      console.error("Error uploading file", error);
      setMessage({ type: 'error', text: 'Error al subir la imagen al servidor.' });
      return null;
    }
  };

  // Handlers for Hero
  const handleHeroImageUpload = async (index, file) => {
     setLoading(true);
     const url = await handleFileUpload(file);
     if (url) {
       const newImages = [...heroConfig.images];
       newImages[index] = url;
       setHeroConfig({ ...heroConfig, images: newImages });
     }
     setLoading(false);
  };

  const addHeroSlide = () => {
     setHeroConfig({ 
       images: [...heroConfig.images, ''], 
       texts: [...heroConfig.texts, 'Nuevo texto para el banner'] 
     });
  };
  const removeHeroSlide = (index) => {
     const newImages = heroConfig.images.filter((_, i) => i !== index);
     const newTexts = heroConfig.texts.filter((_, i) => i !== index);
     setHeroConfig({ images: newImages, texts: newTexts });
  };

  // Projects Handlers
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingProject) {
        await api.put(`/api/projects/${editingProject.id}`, projectForm);
        setMessage({ type: 'success', text: 'Proyecto actualizado con éxito.' });
      } else {
        await api.post('/api/projects', projectForm);
        setMessage({ type: 'success', text: 'Proyecto creado con éxito.' });
      }
      setProjectForm({ title: '', description: '', imageUrl: '', location: '', category: '', date: '', active: true });
      setEditingProject(null);
      const { data } = await api.get('/api/projects');
      setProjects(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al procesar el proyecto.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      setMessage({ type: 'success', text: 'Proyecto eliminado.' });
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar.' });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const resetProjectForm = () => {
    setEditingProject(null);
    setProjectForm({ title: '', description: '', imageUrl: '', location: '', category: '', date: '', active: true });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto dark:bg-dark-primary min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Layout className="text-brand-primary" />
            Personalización Visual
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Modifica el contenido de la landing page en tiempo real.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchCurrentSettings}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Recargar"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl mb-8 w-fit">
        <button 
          onClick={() => setActiveTab('hero')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'hero' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Carrusel Hero
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Sección Productos
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Sección Servicios
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'projects' ? 'bg-white dark:bg-dark-primary text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Galería de Proyectos
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">


        {activeTab === 'hero' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Imágenes y Textos del Banner Principal</h3>
              <button 
                onClick={addHeroSlide}
                className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Plus size={18} /> Añadir Slide
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {heroConfig.images.map((img, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 dark:bg-dark-primary/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0 relative group">
                    {img ? (
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cambiar Imagen del Slide</label>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleHeroImageUpload(idx, e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-green-700"
                      />
                      <p className="mt-1 text-[10px] text-gray-400 truncate">URL: {img || 'Ninguna imagen cargada'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frase del Banner</label>
                      <textarea 
                        value={heroConfig.texts[idx]}
                        onChange={(e) => {
                          const newTexts = [...heroConfig.texts];
                          newTexts[idx] = e.target.value;
                          setHeroConfig({ ...heroConfig, texts: newTexts });
                        }}
                        className="w-full rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm h-20"
                        placeholder="Escribe el mensaje impactante aquí..."
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => removeHeroSlide(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg self-start"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-gray-700">
              <button 
                onClick={() => saveSetting('hero_config', heroConfig)}
                disabled={saving}
                className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Guardando...' : 'Guardar Cambios Hero'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
             <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Productos Destacados (Landing)</h3>
              <p className="text-sm text-gray-500">Estas son las 3 categorías principales que aparecen en el inicio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {productsConfig.map((prod, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-dark-primary/50 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="h-40 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img src={prod.imgSrc} alt={prod.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                    <input 
                      type="text"
                      value={prod.title}
                      onChange={(e) => {
                        const newProds = [...productsConfig];
                        newProds[idx].title = e.target.value;
                        setProductsConfig(newProds);
                      }}
                      className="w-full rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                    <textarea 
                      value={prod.description}
                      onChange={(e) => {
                        const newProds = [...productsConfig];
                        newProds[idx].description = e.target.value;
                        setProductsConfig(newProds);
                      }}
                      className="w-full rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cambiar Imagen de Categoría</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        setLoading(true);
                        const url = await handleFileUpload(e.target.files[0]);
                        if (url) {
                          const newProds = [...productsConfig];
                          newProds[idx].imgSrc = url;
                          setProductsConfig(newProds);
                        }
                        setLoading(false);
                      }}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-gray-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-gray-700">
              <button 
                onClick={() => saveSetting('products_config', productsConfig)}
                disabled={saving}
                className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
              >
                <Save size={20} />
                {saving ? 'Guardando...' : 'Guardar Cambios Productos'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
             <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Servicios de la Landing</h3>
              <p className="text-sm text-gray-500">Ajusta los 3 servicios principales mostrados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {servicesConfig.map((srv, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-dark-primary/50 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="h-40 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img src={srv.imgSrc} alt={srv.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                    <input 
                      type="text"
                      value={srv.title}
                      onChange={(e) => {
                        const newSrvs = [...servicesConfig];
                        newSrvs[idx].title = e.target.value;
                        setServicesConfig(newSrvs);
                      }}
                      className="w-full rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                    <textarea 
                      value={srv.description}
                      onChange={(e) => {
                        const newSrvs = [...servicesConfig];
                        newSrvs[idx].description = e.target.value;
                        setServicesConfig(newSrvs);
                      }}
                      className="w-full rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cambiar Imagen del Servicio</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        setLoading(true);
                        const url = await handleFileUpload(e.target.files[0]);
                        if (url) {
                          const newSrvs = [...servicesConfig];
                          newSrvs[idx].imgSrc = url;
                          setServicesConfig(newSrvs);
                        }
                        setLoading(false);
                      }}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-gray-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-gray-700">
              <button 
                onClick={() => saveSetting('services_config', servicesConfig)}
                disabled={saving}
                className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
              >
                <Save size={20} />
                {saving ? 'Guardando...' : 'Guardar Cambios Servicios'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Gestión de Galería (Obras Finalizadas)</h3>
              <p className="text-sm text-gray-500">Administra los proyectos que aparecen en la sección /proyectos.</p>
            </div>

            <form onSubmit={handleProjectSubmit} className="bg-gray-50 dark:bg-dark-primary/30 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Título del Proyecto"
                  value={projectForm.title}
                  onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                  className="rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Ubicación (ej: Manzanillo, Colima)"
                  value={projectForm.location}
                  onChange={e => setProjectForm({...projectForm, location: e.target.value})}
                  className="rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Categoría (ej: Residencial, Vialidad)"
                  value={projectForm.category}
                  onChange={e => setProjectForm({...projectForm, category: e.target.value})}
                  className="rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Año o Estado (ej: 2024 o En curso)"
                  value={projectForm.date}
                  onChange={e => setProjectForm({...projectForm, date: e.target.value})}
                  className="rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm"
                />
                <div className="flex gap-2">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const url = await handleFileUpload(e.target.files[0]);
                      if (url) setProjectForm({...projectForm, imageUrl: url});
                    }}
                    className="flex-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-200 dark:text-gray-400"
                  />
                  {projectForm.imageUrl && <span className="text-[10px] text-green-500 self-center">✓ Cargada</span>}
                </div>
                <textarea 
                  placeholder="Descripción del proyecto..."
                  value={projectForm.description}
                  onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                  className="md:col-span-2 rounded-lg border-gray-200 dark:bg-dark-surface dark:border-gray-700 dark:text-white text-sm h-20"
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="project-active"
                    checked={projectForm.active}
                    onChange={e => setProjectForm({...projectForm, active: e.target.checked})}
                    className="rounded text-brand-primary"
                  />
                  <label htmlFor="project-active" className="text-sm text-gray-600 dark:text-gray-400">Mostrar en la web (Activo)</label>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                {editingProject && (
                  <button 
                    type="button"
                    onClick={resetProjectForm}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-bold"
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingProject ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {projects.map(proj => (
                <div key={proj.id} className="bg-white dark:bg-dark-primary/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                  <div className="h-40 bg-gray-100 relative">
                    {proj.imageUrl ? (
                      <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon /></div>
                    )}
                    <div className="absolute top-2 left-2">
                       {!proj.active && (
                          <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-1 rounded-full font-bold shadow-sm border border-yellow-200">
                             BORRADOR
                          </span>
                       )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => { setEditingProject(proj); setProjectForm(proj); }}
                        className="p-2 bg-white rounded-full text-blue-500 shadow-lg hover:scale-110 transition"
                      >
                        <Save size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 bg-white rounded-full text-red-500 shadow-lg hover:scale-110 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] uppercase font-bold text-brand-primary">{proj.category || 'General'}</span>
                    <h4 className="font-bold text-gray-800 dark:text-white truncate">{proj.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{proj.description}</p>
                    <div className="mt-3 text-[10px] text-gray-400 flex items-center justify-between font-medium">
                      <span>{proj.location}</span>
                      <span className="bg-gray-100 dark:bg-dark-surface px-2 py-0.5 rounded">{proj.date || 'S/D'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationPage;
