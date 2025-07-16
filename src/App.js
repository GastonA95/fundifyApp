// src/App.js
import React, { useState } from "react";
import Selector from "./components/Selector";
import Editor from "./components/editorContainer"; // Corrected import path
import useMediaQuery from "./hooks/useMediaQuery"; // Import the custom hook
import "./App.css"; // Keep your existing CSS file for general styles

function App() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [userText, setUserText] = useState("");
  const [objectZoom, setObjectZoom] = useState(1);
  const [objectRotation, setObjectRotation] = useState(0);

  // Use the custom hook to check if the screen is small
  const isSmallScreen = useMediaQuery("(max-width: 992px)"); // Define your breakpoint

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

  const handleZoomChange = (newZoom) => {
    setObjectZoom(newZoom);
  };

  const handleRotationChange = (newRotation) => {
    setObjectRotation(newRotation);
  };

  return (
    <div
      className="app-container"
      style={{
        fontFamily: "'Inter', sans-serif", // Using Inter font
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row", // Main layout direction
        alignItems: isSmallScreen ? "center" : "flex-start", // Align top for desktop, center for mobile
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        boxSizing: "border-box",
      }}
    >
      {!selectedModel ? (
        <Selector onModelSelected={setSelectedModel} />
      ) : (
        <div
          className="personalization-area"
          style={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row", // Personalization area also stacks vertically on small screens
            alignItems: isSmallScreen ? "center" : "flex-start", // Align top for desktop, center for mobile
            width: "100%",
            gap: "20px",
          }}
        >
          {/* Left Sidebar (now responsive) */}
          <div
            className="sidebar"
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "12px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
              boxSizing: "border-box",
              width: isSmallScreen ? "100%" : "180px", // Narrower for desktop
              marginBottom: isSmallScreen ? "20px" : "0",
              marginRight: isSmallScreen ? "0" : "20px", // Margin to the right in desktop
              order: isSmallScreen ? 1 : "auto", // First in mobile
              display: "flex",
              flexDirection: isSmallScreen ? "row" : "column",
              justifyContent: isSmallScreen ? "space-around" : "flex-start",
              gap: isSmallScreen ? "10px" : "15px",
              flexWrap: "wrap",
            }}
          >
            {!isSmallScreen && (
              <h2 style={{ marginBottom: "15px", textAlign: "center" }}>
                Crea tu diseño
              </h2>
            )}

            {/* Option Card: Elegir Diseño */}
            <div
              className="option-card"
              style={{
                display: "flex",
                alignItems: "center",
                padding: isSmallScreen ? "10px" : "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                minWidth: isSmallScreen ? "44px" : "auto", // Ensure touch target size
                minHeight: isSmallScreen ? "44px" : "auto",
                flexDirection: isSmallScreen ? "column" : "row", // Stack icon and text vertically in mobile
                justifyContent: isSmallScreen ? "center" : "flex-start",
                textAlign: isSmallScreen ? "center" : "left",
                flex: isSmallScreen ? "1 1 auto" : "none", // Allow flex grow in mobile
              }}
            >
              <div
                className="option-icon"
                style={{
                  fontSize: isSmallScreen ? "1.8em" : "1.5em",
                  marginBottom: isSmallScreen ? "5px" : "0",
                }}
              >
                🖌️
              </div>
              {!isSmallScreen && (
                <div className="option-content" style={{ marginLeft: "10px" }}>
                  <h3 style={{ margin: "0", fontSize: "1.1em" }}>
                    Elegir Diseño
                  </h3>
                  <p style={{ margin: "0", fontSize: "0.8em", color: "#666" }}>
                    Cliparts, formas, dibujar, etc.
                  </p>
                </div>
              )}
            </div>

            {/* Option Card: Subir diseño */}
            <label
              htmlFor="upload-image-input"
              className="option-card"
              style={{
                display: "flex",
                alignItems: "center",
                padding: isSmallScreen ? "10px" : "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                minWidth: isSmallScreen ? "44px" : "auto",
                minHeight: isSmallScreen ? "44px" : "auto",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: isSmallScreen ? "center" : "flex-start",
                textAlign: isSmallScreen ? "center" : "left",
                flex: isSmallScreen ? "1 1 auto" : "none",
              }}
            >
              <div
                className="option-icon"
                style={{
                  fontSize: isSmallScreen ? "1.8em" : "1.5em",
                  marginBottom: isSmallScreen ? "5px" : "0",
                }}
              >
                ⬆️
              </div>
              {!isSmallScreen && (
                <div className="option-content" style={{ marginLeft: "10px" }}>
                  <h3 style={{ margin: "0", fontSize: "1.1em" }}>
                    Subir diseño
                  </h3>
                  <p style={{ margin: "0", fontSize: "0.8em", color: "#666" }}>
                    Explorar o importar
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUserImageUpload}
                style={{ display: "none" }}
                id="upload-image-input"
              />
            </label>

            {/* Option Card: Añadir texto */}
            <div
              className="option-card"
              style={{
                display: "flex",
                alignItems: isSmallScreen ? "center" : "flex-start", // Align text input to start in desktop
                padding: isSmallScreen ? "10px" : "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                minWidth: isSmallScreen ? "44px" : "auto",
                minHeight: isSmallScreen ? "44px" : "auto",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: isSmallScreen ? "center" : "flex-start",
                textAlign: isSmallScreen ? "center" : "left",
                flex: isSmallScreen ? "1 1 auto" : "none",
              }}
            >
              <div
                className="option-icon"
                style={{
                  fontSize: isSmallScreen ? "1.8em" : "1.5em",
                  marginBottom: isSmallScreen ? "5px" : "0",
                }}
              >
                🅰️
              </div>
              {!isSmallScreen && (
                <div
                  className="option-content"
                  style={{ marginLeft: "10px", width: "100%" }}
                >
                  <h3 style={{ margin: "0", fontSize: "1.1em" }}>
                    Añadir texto
                  </h3>
                  <p style={{ margin: "0", fontSize: "0.8em", color: "#666" }}>
                    Añade tu texto aquí
                  </p>
                  <input
                    type="text"
                    placeholder="Escribe tu texto aquí"
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    className="text-input-inside-card"
                    style={{
                      width: "calc(100% - 20px)", // Adjust width for padding
                      padding: "8px",
                      marginTop: "5px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Option Card: Fondo */}
            <div
              className="option-card"
              style={{
                display: "flex",
                alignItems: "center",
                padding: isSmallScreen ? "10px" : "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                minWidth: isSmallScreen ? "44px" : "auto",
                minHeight: isSmallScreen ? "44px" : "auto",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: isSmallScreen ? "center" : "flex-start",
                textAlign: isSmallScreen ? "center" : "left",
                flex: isSmallScreen ? "1 1 auto" : "none",
              }}
            >
              <div
                className="option-icon"
                style={{
                  fontSize: isSmallScreen ? "1.8em" : "1.5em",
                  marginBottom: isSmallScreen ? "5px" : "0",
                }}
              >
                🏞️
              </div>
              {!isSmallScreen && (
                <div className="option-content" style={{ marginLeft: "10px" }}>
                  <h3 style={{ margin: "0", fontSize: "1.1em" }}>Fondo</h3>
                  <p style={{ margin: "0", fontSize: "0.8em", color: "#666" }}>
                    Plantillas listas para usar
                  </p>
                </div>
              )}
            </div>

            {/* Option Card: Stickers */}
            <div
              className="option-card"
              style={{
                display: "flex",
                alignItems: "center",
                padding: isSmallScreen ? "10px" : "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                minWidth: isSmallScreen ? "44px" : "auto",
                minHeight: isSmallScreen ? "44px" : "auto",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: isSmallScreen ? "center" : "flex-start",
                textAlign: isSmallScreen ? "center" : "left",
                flex: isSmallScreen ? "1 1 auto" : "none",
              }}
            >
              <div
                className="option-icon"
                style={{
                  fontSize: isSmallScreen ? "1.8em" : "1.5em",
                  marginBottom: isSmallScreen ? "5px" : "0",
                }}
              >
                🌟
              </div>
              {!isSmallScreen && (
                <div className="option-content" style={{ marginLeft: "10px" }}>
                  <h3 style={{ margin: "0", fontSize: "1.1em" }}>Stickers</h3>
                  <p style={{ margin: "0", fontSize: "0.8em", color: "#666" }}>
                    Genera tu imagen IA
                  </p>
                </div>
              )}
            </div>

            {/* Option Card: Controles de Objeto */}
            <div
              className="option-card"
              style={{
                display: "flex",
                alignItems: "center",
                padding: isSmallScreen ? "10px" : "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
                minWidth: isSmallScreen ? "44px" : "auto",
                minHeight: isSmallScreen ? "44px" : "auto",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: isSmallScreen ? "center" : "flex-start",
                textAlign: isSmallScreen ? "center" : "left",
                flex: isSmallScreen ? "1 1 auto" : "none",
              }}
            >
              <div
                className="option-icon"
                style={{
                  fontSize: isSmallScreen ? "1.8em" : "1.5em",
                  marginBottom: isSmallScreen ? "5px" : "0",
                }}
              >
                ⚙️
              </div>
              {!isSmallScreen && (
                <div className="option-content" style={{ marginLeft: "10px" }}>
                  <h3 style={{ margin: "0", fontSize: "1.1em" }}>
                    Controles de Objeto
                  </h3>
                  <p style={{ margin: "0", fontSize: "0.8em", color: "#666" }}>
                    Ajusta el objeto seleccionado
                  </p>
                </div>
              )}
            </div>

            {/* "Cambiar modelo" button */}
            <button
              onClick={() => setSelectedModel(null)}
              className="back-button"
              style={{
                padding: "10px 15px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#007bff",
                color: "#fff",
                cursor: "pointer",
                marginTop: "20px",
                fontSize: isSmallScreen ? "1em" : "1.1em",
                width: isSmallScreen ? "100%" : "auto",
                order: isSmallScreen ? 99 : "auto",
              }}
            >
              Cambiar modelo
            </button>
          </div>

          {/* Editor View (contains Funda and ControlsPanel) */}
          <div
            className="editor-view"
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column", // Asegura que editor-view en sí mismo sea una columna
              justifyContent: "flex-start", // Alinea el contenido a la parte superior
              alignItems: "center", // Centra horizontalmente
              width: isSmallScreen ? "100%" : "auto",
              order: isSmallScreen ? 2 : "auto",
              // Añade un margen superior para alinear con el menú izquierdo
              // Esto compensa el padding del sidebar y alinea el contenido del editor-view
              // con la parte superior de las "option-card" del sidebar.
              marginTop: isSmallScreen ? "0" : "15px", // 15px es el padding top del sidebar
            }}
          >
            <Editor
              model={selectedModel}
              userImage={userImage}
              userText={userText}
              objectZoom={objectZoom}
              objectRotation={objectRotation}
              onZoomChange={handleZoomChange}
              onRotationChange={handleRotationChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
