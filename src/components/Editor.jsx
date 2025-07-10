import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
} from "react-konva";

const Editor = ({ model, userImage, userText }) => {
  const [fundaImage, setFundaImage] = useState(null);
  const [uploadedKonvaImage, setUploadedKonvaImage] = useState(null);

  const [selectedShapeName, setSelectedShapeName] = useState(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);

  const [showFundaControls, setShowFundaControls] = useState(false);
  const [isFundaHovered, setIsFundaHovered] = useState(false);

  const fundaKonvaImageRef = useRef(null);
  const userImageNodeRef = useRef(null);
  const userTextNodeRef = useRef(null);

  const [selectedScale, setSelectedScale] = useState(1);
  const [selectedRotation, setSelectedRotation] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState({ x: 0, y: 0 });

  const STAGE_WIDTH = 300;
  const STAGE_HEIGHT = 600;

  // Efecto para cargar la imagen de la funda (la plantilla base)
  useEffect(() => {
    if (model && model.imagen) {
      const imageUrl = `${window.location.origin}${model.imagen}`;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => setFundaImage(img);
      img.onerror = (e) => {
        console.error("Konva: ERROR al cargar imagen de funda:", imageUrl, e);
        setFundaImage(null);
      };
    } else {
      setFundaImage(null);
    }
  }, [model]);

  // Efecto para cargar la imagen subida por el usuario y posicionarla/escalarla
  useEffect(() => {
    if (userImage) {
      console.log("Konva: Cargando imagen de usuario desde:", userImage);
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = userImage;
      img.onload = () => {
        setUploadedKonvaImage(img);
        setSelectedShapeName("userImage");
        setSelectedRotation(0); // Resetear rotación al cargar nueva imagen

        // Calcular las propiedades iniciales para "cubrir" y centrar
        const initialProps = calculateInitialImagePropsToCover(img);
        setSelectedScale(initialProps.scale);
        setSelectedPosition({ x: initialProps.x, y: initialProps.y });

        // Si el nodo ya está renderizado, aplicar las propiedades inmediatamente.
        if (userImageNodeRef.current) {
          userImageNodeRef.current.x(initialProps.x);
          userImageNodeRef.current.y(initialProps.y);
          userImageNodeRef.current.scaleX(initialProps.scale);
          userImageNodeRef.current.scaleY(initialProps.scale);
          userImageNodeRef.current.rotation(0);
          userImageNodeRef.current.offsetX(img.width / 2); // Establecer offset al centro para rotación/escala
          userImageNodeRef.current.offsetY(img.height / 2); // Establecer offset al centro para rotación/escala
          userImageNodeRef.current.getLayer().batchDraw(); // Forzar redibujado
        }
      };
      img.onerror = (e) => {
        console.error(
          "Konva: ERROR al cargar imagen de usuario:",
          userImage,
          e
        );
        setUploadedKonvaImage(null);
      };
    } else {
      setUploadedKonvaImage(null);
      if (selectedShapeName === "userImage") {
        setSelectedShapeName(null);
      }
    }
  }, [userImage, selectedShapeName]);

  // Función para calcular las propiedades iniciales de la imagen para que "cubra" el área
  const calculateInitialImagePropsToCover = (img) => {
    // Estas son las dimensiones ESTIMADAS del área que la imagen debe cubrir en el Stage.
    // AJUSTA ESTOS PORCENTAJES (o valores fijos) para que la imagen cubra
    // el área blanca de tu funda perfectamente al cargar.
    // Los valores son ejemplos y pueden necesitar ajuste.
    const caseUsableWidth = STAGE_WIDTH * 1.0; // Usaste 1.0 manualmente, lo mantengo aquí
    const caseUsableHeight = STAGE_HEIGHT * 1.0; // Usaste 1.0 manualmente, lo mantengo aquí

    const imageAspectRatio = img.width / img.height;
    const targetAspectRatio = caseUsableWidth / caseUsableHeight;

    let finalScale;

    if (imageAspectRatio > targetAspectRatio) {
      // La imagen es más ancha que el área objetivo, escalar por altura para cubrir.
      finalScale = caseUsableHeight / img.height;
    } else {
      // La imagen es más alta que el área objetivo, escalar por ancho para cubrir.
      finalScale = caseUsableWidth / img.width;
    }

    // Centrar la imagen escalada en el centro del STAGE
    // Ahora que usamos offset para centrar el pivote, las coordenadas x, y
    // deben ser el centro del stage.
    const x = STAGE_WIDTH / 2;
    const y = STAGE_HEIGHT / 2;

    return { scale: finalScale, x, y };
  };

  // Función para escalar y centrar la imagen de la funda (la plantilla)
  const getFundaImageProps = () => {
    if (!fundaImage) return {};
    const imageAspectRatio = fundaImage.width / fundaImage.height;
    const stageAspectRatio = STAGE_WIDTH / STAGE_HEIGHT;
    let newWidth, newHeight;
    if (imageAspectRatio > stageAspectRatio) {
      newWidth = STAGE_WIDTH;
      newHeight = STAGE_WIDTH / imageAspectRatio;
    } else {
      newHeight = STAGE_HEIGHT;
      newWidth = STAGE_HEIGHT * imageAspectRatio;
    }
    return {
      image: fundaImage,
      width: newWidth,
      height: newHeight,
      x: (STAGE_WIDTH - newWidth) / 2,
      y: (STAGE_HEIGHT - newHeight) / 2,
      listening: true,
      name: "fundaImage",
      // Efecto de hover: ligeramente transparente y con un tinte si está en hover
      filters: isFundaHovered ? [window.Konva.Filters.RGBA] : [],
      red: isFundaHovered ? 150 : 0, // Ajuste de color para el hover
      green: isFundaHovered ? 150 : 0,
      blue: isFundaHovered ? 200 : 0,
      alpha: isFundaHovered ? 0.6 : 0, // Aumenta la opacidad para que sea más visible
    };
  };

  // Efecto para adjuntar el Transformer al nodo seleccionado y actualizar los estados
  useEffect(() => {
    if (trRef.current) {
      trRef.current.nodes([]);
      let nodeToAttach = null;

      if (selectedShapeName === "userImage" && userImageNodeRef.current) {
        nodeToAttach = userImageNodeRef.current;
      } else if (selectedShapeName === "userText" && userTextNodeRef.current) {
        nodeToAttach = userTextNodeRef.current;
      }

      if (nodeToAttach) {
        trRef.current.nodes([nodeToAttach]);
        setSelectedScale(nodeToAttach.scaleX());
        setSelectedRotation(nodeToAttach.rotation());
        setSelectedPosition({ x: nodeToAttach.x(), y: nodeToAttach.y() });
      }
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeName]);

  // Manejador de clics en el Stage para deseleccionar objetos o seleccionar la funda
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === "fundaImage") {
      setSelectedShapeName(null);
      setShowFundaControls(
        e.target.name() === "fundaImage" || !selectedShapeName
      );
    }
  };

  // Manejador de clics en la imagen de usuario
  const handleImageClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName("userImage");
    setShowFundaControls(true);
  };

  // Manejador de clics en el texto de usuario
  const handleTextClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName("userText");
    setShowFundaControls(true);
  };

  // --- Manejadores de la funda ---
  const handleFundaMouseEnter = () => {
    setIsFundaHovered(true);
    fundaKonvaImageRef.current?.getLayer().batchDraw();
  };

  const handleFundaMouseLeave = () => {
    setIsFundaHovered(false);
    fundaKonvaImageRef.current?.getLayer().batchDraw();
  };

  const handleFundaClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName(null);
    setShowFundaControls(true);
    setIsFundaHovered(false);
  };
  // --- Fin manejadores de la funda ---

  // Manejador cuando la transformación (escala, rotación, etc.) termina
  const handleTransformEnd = (e) => {
    setSelectedScale(e.target.scaleX());
    setSelectedRotation(e.target.rotation());
    setSelectedPosition({ x: e.target.x(), y: e.target.y() });
  };

  // Manejador cuando el arrastre de un objeto termina
  const handleDragEnd = (e) => {
    setSelectedPosition({ x: e.target.x(), y: e.target.y() });
  };

  // --- Manejadores para los sliders de zoom y rotación del objeto seleccionado ---
  const handleSelectedScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setSelectedScale(newScale);

    let node = null;
    if (selectedShapeName === "userImage" && userImageNodeRef.current) {
      node = userImageNodeRef.current;
    } else if (selectedShapeName === "userText" && userTextNodeRef.current) {
      node = userTextNodeRef.current;
    }

    if (node) {
      node.scale({ x: newScale, y: newScale });
      node.getLayer().batchDraw();
      trRef.current?.update();
    }
  };

  const handleSelectedRotationChange = (e) => {
    const newRotation = parseInt(e.target.value, 10);
    setSelectedRotation(newRotation);

    let node = null;
    if (selectedShapeName === "userImage" && userImageNodeRef.current) {
      node = userImageNodeRef.current;
    } else if (selectedShapeName === "userText" && userTextNodeRef.current) {
      node = userTextNodeRef.current;
    }

    if (node) {
      node.rotation(newRotation);
      node.getLayer().batchDraw();
      trRef.current?.update();
    }
  };

  // --- Funciones para mover el objeto seleccionado con los botones ---
  const moveSelectedObject = (dx, dy) => {
    let node = null;
    if (selectedShapeName === "userImage" && userImageNodeRef.current) {
      node = userImageNodeRef.current;
    } else if (selectedShapeName === "userText" && userTextNodeRef.current) {
      node = userTextNodeRef.current;
    }

    if (node) {
      node.x(node.x() + dx);
      node.y(node.y() + dy);
      setSelectedPosition({ x: node.x(), y: node.y() });
      node.getLayer().batchDraw();
      trRef.current?.update();
    }
  };

  // --- Función para eliminar la imagen y el texto del usuario ---
  const handleClearDesign = () => {
    setUploadedKonvaImage(null);
    setSelectedShapeName(null);
    setShowFundaControls(false);
    setSelectedScale(1);
    setSelectedRotation(0);
    // Resetear posición al centro del stage, ya que x/y representan el centro con offset.
    setSelectedPosition({ x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 });

    if (userTextNodeRef.current) {
      userTextNodeRef.current.destroy();
      userTextNodeRef.current = null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        ref={stageRef}
        style={{ backgroundColor: "#f0f0f0" }}
        onClick={handleStageClick}
      >
        <Layer>
          {/* 1. Imagen subida por el usuario */}
          {uploadedKonvaImage && (
            <KonvaImage
              image={uploadedKonvaImage}
              x={selectedPosition.x}
              y={selectedPosition.y}
              width={uploadedKonvaImage.width}
              height={uploadedKonvaImage.height}
              scaleX={selectedScale}
              scaleY={selectedScale}
              rotation={selectedRotation}
              offsetX={uploadedKonvaImage.width / 2} // Importante: pivote al centro
              offsetY={uploadedKonvaImage.height / 2} // Importante: pivote al centro
              draggable
              name="userImage"
              onClick={handleImageClick}
              onTap={handleImageClick}
              onTransformEnd={handleTransformEnd}
              onDragEnd={handleDragEnd}
              ref={userImageNodeRef}
            />
          )}

          {/* 2. Texto del usuario */}
          {userText && (
            <KonvaText
              text={userText}
              fontSize={30}
              fill="black"
              // Posición inicial del texto (puedes ajustar o centrarlo dinámicamente)
              x={selectedPosition.x + 20}
              y={selectedPosition.y + 20}
              // Importante: offset dinámico para el texto
              offsetX={
                userTextNodeRef.current
                  ? userTextNodeRef.current.width() / 2
                  : 0
              }
              offsetY={
                userTextNodeRef.current
                  ? userTextNodeRef.current.height() / 2
                  : 0
              }
              draggable
              name="userText"
              onClick={handleTextClick}
              onTap={handleTextClick}
              onTransformEnd={handleTransformEnd}
              onDragEnd={handleDragEnd}
              ref={userTextNodeRef}
              scaleX={selectedScale}
              scaleY={selectedScale}
              rotation={selectedRotation}
            />
          )}

          {/* 3. Imagen de la funda (siempre al fondo) */}
          {fundaImage && (
            <KonvaImage
              {...getFundaImageProps()}
              name="fundaImage"
              onMouseEnter={handleFundaMouseEnter}
              onMouseLeave={handleFundaMouseLeave}
              onClick={handleFundaClick}
              onTap={handleFundaClick}
              ref={fundaKonvaImageRef}
            />
          )}

          {/* Transformer - Se adjunta al objeto seleccionado */}
          <Transformer ref={trRef} />
        </Layer>
      </Stage>
      {/* Menú de opciones de la funda */}
      {showFundaControls && (
        <div
          className="funda-controls-menu"
          style={{
            position: "absolute",
            top: 0,
            left: STAGE_WIDTH + 20,
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
      )}
    </div>
  );
};

export default Editor;
