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
  const [isFundaHovered, setIsFundaHovered] = useState(false); // Estado para el hover de la funda

  const fundaKonvaImageRef = useRef(null);
  const userImageNodeRef = useRef(null);
  const userTextNodeRef = useRef(null);

  // Estados para controlar la escala y rotación del objeto SELECCIONADO
  // Aseguramos que `selectedScale` y `selectedRotation` se inicialicen correctamente
  const [selectedScale, setSelectedScale] = useState(1);
  const [selectedRotation, setSelectedRotation] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState({ x: 0, y: 0 }); // Posición del elemento seleccionado

  const STAGE_WIDTH = 300;
  const STAGE_HEIGHT = 600;

  // Efecto para cargar la imagen de la funda (la plantilla)
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

  // Efecto para cargar la imagen subida por el usuario
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
        // Esto evita un "parpadeo" antes de que React actualice el componente.
        if (userImageNodeRef.current) {
          userImageNodeRef.current.x(initialProps.x);
          userImageNodeRef.current.y(initialProps.y);
          userImageNodeRef.current.scaleX(initialProps.scale);
          userImageNodeRef.current.scaleY(initialProps.scale);
          userImageNodeRef.current.rotation(0);
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
    // Basado en las imágenes, ajusta estos porcentajes para que la imagen cubra
    // el área blanca de tu funda perfectamente al cargar.
    // Los valores 0.7 y 0.9 son una estimación, ajústalos según la forma de tu funda.
    const caseUsableWidth = STAGE_WIDTH * 0.7; // Ancho aproximado del área de diseño
    const caseUsableHeight = STAGE_HEIGHT * 0.9; // Alto aproximado del área de diseño

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

    // Calcular las dimensiones finales de la imagen con esta escala
    const finalImageWidth = img.width * finalScale;
    const finalImageHeight = img.height * finalScale;

    // Centrar la imagen escalada en el centro del STAGE
    const x = (STAGE_WIDTH - finalImageWidth) / 2;
    const y = (STAGE_HEIGHT - finalImageHeight) / 2;

    return { scale: finalScale, x, y };
  };

  // Función para escalar y centrar la imagen de la funda (la plantilla)
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
      newHeight = STAGE_HEIGHT; // <--- Línea corregida
      newWidth = STAGE_HEIGHT * imageAspectRatio;
    }
    return {
      image: fundaImage,
      width: newWidth,
      height: newHeight,
      x: (STAGE_WIDTH - newWidth) / 2,
      y: (STAGE_HEIGHT - newHeight) / 2,
      listening: true, // Debe escuchar eventos
      name: "fundaImage", // Nombre para identificarla
      // Efecto de hover: ligeramente transparente y con un tinte si está en hover
      filters: isFundaHovered ? [window.Konva.Filters.RGBA] : [],
      red: isFundaHovered ? 255 : 0,
      green: isFundaHovered ? 255 : 0,
      blue: isFundaHovered ? 255 : 0,
      alpha: isFundaHovered ? 0.2 : 0, // Ajusta la opacidad para el efecto visual
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
        // Asegurarse de que el transformer se inicialice con los valores actuales del nodo
        // (Esto ya se hace implícitamente, pero es bueno ser explícito en el flujo de trabajo)
        setSelectedScale(nodeToAttach.scaleX());
        setSelectedRotation(nodeToAttach.rotation());
        setSelectedPosition({ x: nodeToAttach.x(), y: nodeToAttach.y() });
      }
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeName]);

  const handleStageClick = (e) => {
    // Si el clic es en el Stage o en la imagen de la funda, deseleccionar todo lo demás.
    if (e.target === e.target.getStage() || e.target.name() === "fundaImage") {
      setSelectedShapeName(null);
      // Muestra los controles de la funda si se hizo clic en ella o en el Stage y no hay nada seleccionado
      setShowFundaControls(
        e.target.name() === "fundaImage" || !selectedShapeName
      );
    }
  };

  const handleImageClick = (e) => {
    e.cancelBubble = true; // Evita que el clic se propague al Stage
    setSelectedShapeName("userImage");
    setShowFundaControls(true); // Mostrar controles cuando se selecciona una imagen
  };

  const handleTextClick = (e) => {
    e.cancelBubble = true; // Evita que el clic se propague al Stage
    setSelectedShapeName("userText");
    setShowFundaControls(true); // Mostrar controles cuando se selecciona un texto
  };

  // --- Manejadores de la funda ---
  const handleFundaMouseEnter = () => {
    setIsFundaHovered(true);
    fundaKonvaImageRef.current?.getLayer().batchDraw(); // Forzar redibujado para el efecto
  };

  const handleFundaMouseLeave = () => {
    setIsFundaHovered(false);
    fundaKonvaImageRef.current?.getLayer().batchDraw(); // Forzar redibujado para el efecto
  };

  const handleFundaClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName(null); // Deseleccionar cualquier otro objeto
    setShowFundaControls(true); // Siempre mostrar los controles de funda al hacer clic en ella
    setIsFundaHovered(false); // Quitar el efecto de hover si se hace clic
  };
  // --- Fin manejadores de la funda ---

  // Este manejador es crucial para capturar los cambios del Transformer (escala, rotación, sesgado)
  const handleTransformEnd = (e) => {
    // Cuando el usuario termina de transformar con el mouse/touch, actualizamos los estados.
    setSelectedScale(e.target.scaleX());
    setSelectedRotation(e.target.rotation());
    setSelectedPosition({ x: e.target.x(), y: e.target.y() });
  };

  // Manejador para el evento dragEnd de la imagen/texto
  const handleDragEnd = (e) => {
    // Cuando el usuario termina de arrastrar, actualizamos la posición.
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
      // Para escalar desde el centro:
      // 1. Guardar la posición actual (top-left) del nodo.
      const oldX = node.x();
      const oldY = node.y();
      const oldWidth = node.width() * node.scaleX();
      const oldHeight = node.height() * node.scaleY();

      // 2. Aplicar la nueva escala.
      node.scale({ x: newScale, y: newScale });

      // 3. Recalcular la nueva posición para que el centro se mantenga
      //    (nueva_x = centro_original_x - nueva_width/2)
      //    (nueva_y = centro_original_y - nueva_height/2)
      const newWidth = node.width() * newScale;
      const newHeight = node.height() * newScale;
      const centerX = oldX + oldWidth / 2;
      const centerY = oldY + oldHeight / 2;
      node.x(centerX - newWidth / 2);
      node.y(centerY - newHeight / 2);

      setSelectedPosition({ x: node.x(), y: node.y() }); // Actualizar el estado
      node.getLayer().batchDraw();
      trRef.current?.update(); // Actualizar el transformer para que refleje los cambios
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
      // Para rotar desde el centro del objeto:
      // Konva automáticamente rota alrededor del centro del bounding box del nodo
      // cuando no hay offset y el Transformer está conectado.
      node.rotation(newRotation);
      node.getLayer().batchDraw();
      trRef.current?.update(); // Actualizar el transformer
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
    setShowFundaControls(false); // Ocultar controles al borrar
    setSelectedScale(1);
    setSelectedRotation(0);
    setSelectedPosition({ x: 0, y: 0 }); // Resetear posición

    // Para el texto, si lo necesitas borrar permanentemente del stage
    if (userTextNodeRef.current) {
      userTextNodeRef.current.destroy(); // Elimina el nodo Konva del stage
      userTextNodeRef.current = null; // Limpia la referencia
    }
    // Si userText es un estado de un componente padre, deberías resetearlo allí
    // por ejemplo, con una prop onClearUserText.
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
              width={uploadedKonvaImage.width} // Usar el ancho original
              height={uploadedKonvaImage.height} // Usar el alto original
              scaleX={selectedScale}
              scaleY={selectedScale}
              rotation={selectedRotation}
              draggable
              name="userImage"
              onClick={handleImageClick}
              onTap={handleImageClick}
              onTransformEnd={handleTransformEnd}
              onDragEnd={handleDragEnd}
              ref={userImageNodeRef}
              // IMPORTANT: Konva's Transformer applies transformations from the center
              // by default if offset is not set.
              // If you need custom pivot points for manual scaling, consider .offset()
            />
          )}

          {/* 2. Texto del usuario */}
          {userText && (
            <KonvaText
              text={userText}
              fontSize={30}
              fill="black"
              // Calcular posición inicial para el texto de forma similar a la imagen
              // O simplemente iniciar en el centro del stage
              x={selectedPosition.x + 20} // Esto puede ser un valor inicial fijo o calculado
              y={selectedPosition.y + 20}
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
          {selectedShapeName && ( // Mostrar controles de tamaño/rotación solo si hay un objeto de usuario seleccionado
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

              {/* Botones de movimiento (simulando flechas) */}
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
