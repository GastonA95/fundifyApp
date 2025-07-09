import React, { useState } from "react";
// Importa tu CSS si lo tienes
// import "./Selector.css";

const Selector = ({ onModelSelected }) => {
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Simulamos marcas y modelos
  const brands = [
    {
      id: "apple",
      nombre: "Apple",
      modelos: [
        { id: "iphone13", nombre: "iPhone 13", imagen: "/fundas/iphone13.png" },
        { id: "iphone14", nombre: "iPhone 14", imagen: "/fundas/iphone14.png" },
      ],
    },
    {
      id: "samsung",
      nombre: "Samsung",
      modelos: [
        { id: "s21", nombre: "Galaxy S21", imagen: "/fundas/s21.png" },
        { id: "s22", nombre: "Galaxy S22", imagen: "/fundas/s22.png" },
      ],
    },
    {
      id: "motorola",
      nombre: "Motorola",
      modelos: [
        { id: "g22", nombre: "Moto G22", imagen: "/fundas/g22.png" },
        { id: "g32", nombre: "Moto G32", imagen: "/fundas/g32.png" },
      ],
    },
  ];

  const handleBrandSelect = (brandId) => {
    setSelectedBrand(brandId);
  };

  const handleModelSelect = (model) => {
    onModelSelected(model);
  };

  return (
    <div className="selector-container">
      {!selectedBrand && (
        <>
          <h2>1. Elegí la marca</h2>
          <div className="brand-cards">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="brand-card"
                onClick={() => handleBrandSelect(brand.id)}
              >
                {brand.nombre}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedBrand && (
        <>
          <h2>2. Elegí el modelo</h2>
          <div className="model-cards">
            {brands
              .find((b) => b.id === selectedBrand)
              .modelos.map((model) => (
                <div
                  key={model.id}
                  className="model-card"
                  onClick={() => handleModelSelect(model)}
                >
                  {model.nombre}
                </div>
              ))}
          </div>
          <button
            onClick={() => setSelectedBrand(null)}
            style={{ marginTop: "20px" }}
          >
            ◀ Volver a Marcas
          </button>
        </>
      )}
    </div>
  );
};

export default Selector;
