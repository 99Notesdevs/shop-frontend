export default function Hero() {

  return (
    <section className="relative h-[60vh] flex items-center justify-center bg-gray-200">
      {/* Hero Content */}
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to Our Store
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover amazing products and exclusive deals
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition duration-300">
          Shop Now
        </button>
      </div>
    </section>
  );
}
