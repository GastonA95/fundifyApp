import React from "react";

const ControlsPanel = ({
  selectedShapeName,
  selectedScale,
  selectedRotation,
  handleSelectedScaleChange,
  handleSelectedRotationChange,
  moveSelectedObject,
  handleClearDesign,
  setSelectedShapeName,
}) => (
  <div
    className="funda-controls-menu"
    style={{
      position: "absolute",
      top: 0,
      left: 320, // STAGE_WIDTH + 20
      backgroundColor: "white",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      minWidth: "200px",
    }}
  >
    <h4>Opciones de Diseño</h4>
    {selectedShapeName && (
      <>
        {/* Controles de Zoom */}
        <div className="control-group">
          <label>Tamaño</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.01"
            value={selectedScale}
            onChange={handleSelectedScaleChange}
          />
          <span>{Math.round(selectedScale * 100)}%</span>
        </div>
        {/* Controles de Rotación */}
        <div className="control-group">
          <label>Rotación</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={selectedRotation}
            onChange={handleSelectedRotationChange}
          />
          <span>{selectedRotation}°</span>
        </div>
        {/* Botones de movimiento */}
        <div
          className="control-group"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <label>Mover</label>
          <button onClick={() => moveSelectedObject(0, -10)}>⬆️</button>
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={() => moveSelectedObject(-10, 0)}>⬅️</button>
            <button onClick={() => moveSelectedObject(10, 0)}>➡️</button>
          </div>
          <button onClick={() => moveSelectedObject(0, 10)}>⬇️</button>
        </div>
      </>
    )}
    <button
      className="control-button"
      onClick={() => setSelectedShapeName(null)}
    >
      ← Deseleccionar
    </button>
    <button className="control-button" onClick={handleClearDesign}>
      🗑️ Eliminar Diseño
    </button>
    <div className="undo-redo-controls">
      <button className="control-button">↩️ Deshacer (Ctrl+Z)</button>
      <button className="control-button">↪️ Rehacer (Ctrl+Y)</button>
    </div>
    <button className="control-button">✏️ Fondo</button>
  </div>
);

export default ControlsPanel;
