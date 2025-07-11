// src/App.js
import React, { useState } from "react";
import Selector from "./components/Selector";
import Editor from "./components/editor";
import "./App.css";

function App() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [userText, setUserText] = useState("");
  // Nuevos estados para controlar el tamaño y la rotación en App.js
  const [objectZoom, setObjectZoom] = useState(1);
  const [objectRotation, setObjectRotation] = useState(0);

  const handleUserImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler para el cambio de zoom
  const handleZoomChange = (newZoom) => {
    setObjectZoom(newZoom);
  };

  // Handler para el cambio de rotación
  const handleRotationChange = (newRotation) => {
    setObjectRotation(newRotation);
  };

  return (
    <div className="app-container">
      {!selectedModel ? (
        <Selector onModelSelected={setSelectedModel} />
      ) : (
        <div className="personalization-area">
          <div className="sidebar">
            <h2>Crea tu diseño</h2>

            {/* Botón/Tarjeta para ELEGIR DISEÑO (antes Añadir Diseños) */}
            <div className="option-card">
              <div className="option-icon">
                {/* Icono actualizado: Puedes usar un pincel, una paleta, o un diseño abstracto */}
                🖌️
              </div>
              <div className="option-content">
                <h3>Elegir Diseño</h3> {/* Texto cambiado */}
                <p>Cliparts, formas, dibujar, etc.</p>
              </div>
            </div>

            {/* Botón/Tarjeta para Subir Diseño */}
            <label htmlFor="upload-image-input" className="option-card">
              <div className="option-icon">
                {/* Icono de subir archivo */}
                ⬆️
              </div>
              <div className="option-content">
                <h3>Subir diseño</h3>
                <p>Explorar o importar</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUserImageUpload}
                style={{ display: "none" }}
                id="upload-image-input"
              />
            </label>

            {/* Botón/Tarjeta para Añadir Texto */}
            <div className="option-card">
              <div className="option-icon">
                {/* Icono de texto */}
                🅰️
              </div>
              <div className="option-content">
                <h3>Añadir texto</h3>
                <p>Añade tu texto aquí</p>
                <input
                  type="text"
                  placeholder="Escribe tu texto aquí"
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  className="text-input-inside-card"
                />
              </div>
            </div>

            {/* Botón/Tarjeta para FONDO (antes Ideas de Diseño) */}
            <div className="option-card">
              <div className="option-icon">
                {/* Icono actualizado: Un paisaje, un fondo, un gradiente */}
                🏞️
              </div>
              <div className="option-content">
                <h3>Fondo</h3> {/* Texto cambiado */}
                <p>Plantillas listas para usar</p>
              </div>
            </div>

            {/* Botón/Tarjeta para STICKERS (antes Imagen IA) */}
            <div className="option-card">
              <div className="option-icon">
                {/* Icono actualizado: Una calcomanía, una estrella, algo que evoque "sticker" */}
                🌟
              </div>
              <div className="option-content">
                <h3>Stickers</h3> {/* Texto cambiado */}
                <p>Genera tu imagen IA</p>{" "}
                {/* Esta descripción podría cambiar a "Añadir elementos decorativos" o similar si la IA ya no genera */}
              </div>
            </div>

            {/* Controles de Objeto - Pasamos el estado y los handlers al Editor */}
            <div className="option-card">
              <div className="option-icon">⚙️</div>
              <div className="option-content">
                <h3>Controles de Objeto</h3>
                <p>Ajusta el objeto seleccionado</p>
                {/* Estos inputs deben estar en Editor.jsx porque manipulan directamente el canvas */}
                {/* No los replicamos aquí, solo los pasamos como props */}
                {/* Aquí podríamos tener un botón para "Aplicar cambios" si se gestionan centralmente */}
              </div>
            </div>

            {/* Botón para volver a seleccionar modelo */}
            <button
              onClick={() => setSelectedModel(null)}
              className="back-button"
            >
              Cambiar modelo
            </button>
          </div>

          <div className="editor-view">
            <Editor
              model={selectedModel}
              userImage={userImage}
              userText={userText}
              objectZoom={objectZoom} // Pasa el estado del zoom
              objectRotation={objectRotation} // Pasa el estado de la rotación
              onZoomChange={handleZoomChange} // Pasa el handler del zoom
              onRotationChange={handleRotationChange} // Pasa el handler de la rotación
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
