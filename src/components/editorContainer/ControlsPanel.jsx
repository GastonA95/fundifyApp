// src/components/ControlsPanel.jsx
import React from "react";
// You would import your actual icon components here, e.g.:
// import { FaTrash, FaUndo, FaRedo, FaArrowsAltH, FaArrowsAltV, FaRedoAlt, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const ControlsPanel = ({
  selectedShapeName,
  selectedScale,
  selectedRotation,
  handleSelectedScaleChange,
  handleSelectedRotationChange,
  moveSelectedObject,
  handleClearDesign,
  setSelectedShapeName,
  isSmallScreen, // Still useful for minor adjustments if needed
}) => {
  // Determina si el panel debe estar activo (e.g., cuando una forma está seleccionada)
  const isActive = !!selectedShapeName; // True si selectedShapeName no es null o cadena vacía

  return (
    <div
      style={{
        // Estilos base para el panel de controles (apariencia de tarjeta)
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "12px", // Esquinas redondeadas
        backgroundColor: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)", // Sombra sutil
        boxSizing: "border-box", // Incluye el padding en el cálculo del ancho/alto total
        position: "relative", // Siempre relativo, para que fluya en el documento
        // Ancho ajustado para un mejor equilibrio visual con la funda (300px)
        width: isSmallScreen ? "100%" : "300px", // Coincide con STAGE_WIDTH para escritorio
        // Controla la visibilidad e interactividad según si está activo
        opacity: isActive ? 1 : 0.4, // Desvanecido cuando está inactivo
        pointerEvents: isActive ? "auto" : "none", // No se puede hacer clic cuando está inactivo
        transition: "opacity 0.3s ease-in-out", // Transición suave para la opacidad
      }}
    >
      {/* Diseño para todas las pantallas (ahora unificado y compacto) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* Fila superior: Desseleccionar, Tamaño, Rotación */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 2fr",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setSelectedShapeName(null)}
            disabled={!isActive} // Deshabilitado si no hay forma seleccionada
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor: "#f0f0f0",
              cursor: isActive ? "pointer" : "not-allowed",
              fontSize: "1.5em", // Icono más grande
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            ⬅️ {/* Icono de flecha hacia atrás */}
          </button>
          {/* Los controles de Escala y Rotación solo se muestran si hay un objeto seleccionado */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <label
              htmlFor="scale"
              style={{ fontSize: "0.9em", fontWeight: "bold" }}
            >
              🔍 TAMAÑO
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.01"
              value={selectedScale}
              onChange={handleSelectedScaleChange}
              id="scale"
              style={{ width: "100%" }}
              disabled={!isActive} // Deshabilitado si no hay forma seleccionada
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <label
              htmlFor="rotation"
              style={{ fontSize: "0.9em", fontWeight: "bold" }}
            >
              🔄 ROTACIÓN
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={selectedRotation}
              onChange={handleSelectedRotationChange}
              id="rotation"
              style={{ width: "100%" }}
              disabled={!isActive} // Deshabilitado si no hay forma seleccionada
            />
          </div>
        </div>

        {/* Fila inferior: Eliminar Diseño, Deshacer, Rehacer, Fondo */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleClearDesign}
            disabled={!isActive} // Deshabilitado si no hay forma seleccionada
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor: "#f0f0f0",
              cursor: isActive ? "pointer" : "not-allowed",
              fontSize: "1.5em", // Icono más grande
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            🗑️
          </button>
          <button
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor: "#f0f0f0",
              cursor: "not-allowed",
              fontSize: "1em",
              textAlign: "center",
            }}
            disabled // Siempre deshabilitado ya que la lógica no está implementada
          >
            ↩️ Deshacer
            <br />
            Ctrl+z
          </button>
          <button
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor: "#f0f0f0",
              cursor: "not-allowed",
              fontSize: "1em",
              textAlign: "center",
            }}
            disabled // Siempre deshabilitado
          >
            ↪️ Rehacer
            <br />
            Ctrl+y
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <label
              htmlFor="fondoControl"
              style={{ fontSize: "0.9em", fontWeight: "bold" }}
            >
              🖼️ FONDO
            </label>
            <input
              type="checkbox"
              id="fondoControl"
              style={{ transform: "scale(1.2)" }}
              disabled={!isActive}
            />{" "}
            {/* Deshabilitado si no hay forma seleccionada */}
          </div>
        </div>

        {/* Controles de Movimiento (si está seleccionado, debajo de las filas principales) */}
        {isActive && ( // Solo muestra los controles de movimiento si hay una forma seleccionada
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "10px",
              paddingTop: "10px",
              borderTop: "1px solid #eee",
            }}
          >
            <h4 style={{ margin: "0", fontSize: "1.1em", textAlign: "center" }}>
              Mover Objeto
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "5px",
                maxWidth: "150px",
                margin: "auto",
              }}
            >
              <button
                onClick={() => moveSelectedObject(0, -10)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1.2em",
                }}
              >
                ⬆️
              </button>
              <div />
              <button
                onClick={() => moveSelectedObject(0, 10)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1.2em",
                }}
              >
                ⬇️
              </button>
              <button
                onClick={() => moveSelectedObject(-10, 0)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1.2em",
                }}
              >
                ⬅️
              </button>
              <div />
              <button
                onClick={() => moveSelectedObject(10, 0)}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1.2em",
                }}
              >
                ➡️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlsPanel;
