export default function Products() {
  const handleVisitStore = () => {
    window.open('https://natursur.herbalife.com/es-es/u', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-[#009BA6] mb-4">
          Nuestros Productos
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Distribuidor Oficial de Herbalife Nutrition y otros productos de bienestar
        </p>
      </div>

      {/* Herbalife Section */}
      <div className="bg-gradient-to-br from-[#009BA6]/10 to-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#009BA6] mb-4">
              Herbalife Nutrition
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Como <strong>distribuidor oficial de Herbalife</strong>, ofrecemos acceso a una amplia gama de 
              productos nutricionales de alta calidad diseñados para apoyar tu bienestar integral.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-[#009BA6] text-xl">✓</span>
                <span className="text-gray-700">Nutrición personalizada y control de peso</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#009BA6] text-xl">✓</span>
                <span className="text-gray-700">Suplementos vitamínicos y proteínas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#009BA6] text-xl">✓</span>
                <span className="text-gray-700">Productos de energía y fitness</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#009BA6] text-xl">✓</span>
                <span className="text-gray-700">Cuidado personal y bienestar diario</span>
              </li>
            </ul>
            <button
              onClick={handleVisitStore}
              className="px-8 py-4 bg-[#009BA6] text-white font-bold text-lg rounded-lg hover:bg-[#007a82] transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Visitar Tienda Online →
            </button>
          </div>

          <div className="relative">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="aspect-square bg-gradient-to-br from-[#009BA6] to-[#007a82] rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🌿</div>
                  <p className="text-2xl font-bold mb-2">Herbalife</p>
                  <p className="text-sm opacity-90">Nutrición de Calidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-4">🏅</div>
          <h3 className="text-xl font-bold text-[#009BA6] mb-2">Calidad Garantizada</h3>
          <p className="text-gray-600 text-sm">
            Productos respaldados por más de 40 años de investigación científica
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-4">💚</div>
          <h3 className="text-xl font-bold text-[#009BA6] mb-2">Bienestar Integral</h3>
          <p className="text-gray-600 text-sm">
            Soluciones completas para nutrición, energía y cuidado personal
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-bold text-[#009BA6] mb-2">Asesoramiento Personalizado</h3>
          <p className="text-gray-600 text-sm">
            Te ayudamos a elegir los productos adecuados para tus objetivos
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#009BA6] text-white rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para transformar tu bienestar?
        </h2>
        <p className="text-lg mb-6 opacity-90">
          Descubre nuestra gama completa de productos Herbalife y encuentra el plan perfecto para ti
        </p>
        <button
          onClick={handleVisitStore}
          className="px-8 py-4 bg-white text-[#009BA6] font-bold text-lg rounded-lg hover:bg-gray-100 transition shadow-lg inline-flex items-center gap-2"
        >
          Explorar Productos
          <span>→</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-600 text-sm">
        <p>
          Al hacer clic, serás redirigido a nuestra tienda oficial de Herbalife Nutrition
        </p>
      </div>
    </div>
  )
}
