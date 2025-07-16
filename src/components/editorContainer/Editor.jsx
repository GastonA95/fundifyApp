import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Transformer } from "react-konva";
// CORRECCIÓN: Ajustadas las rutas de importación para apuntar al mismo directorio
import FundaImage from "./FundaImage";
import UserImage from "./UserImage";
import UserText from "./UserText";
import ControlsPanel from "./ControlsPanel";
import useMediaQuery from "../../hooks/useMediaQuery"; // Ajusta la ruta para subir dos niveles

const Editor = ({ model, userImage, userText }) => {
  const [fundaImage, setFundaImage] = useState(null);
  const [uploadedKonvaImage, setUploadedKonvaImage] = useState(null);
  const [selectedShapeName, setSelectedShapeName] = useState(null);
  // Eliminadas las variables de estado showFundaControls y setShowFundaControls ya que el ControlsPanel siempre es visible
  const [isFundaHovered, setIsFundaHovered] = useState(false);
  const [selectedScale, setSelectedScale] = useState(1);
  const [selectedRotation, setSelectedRotation] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState({ x: 0, y: 0 });

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const fundaKonvaImageRef = useRef(null);
  const userImageNodeRef = useRef(null);
  const userTextNodeRef = useRef(null);

  // Define the fixed dimensions for the Konva stage
  const STAGE_WIDTH = 300;
  const STAGE_HEIGHT = 600;

  // Use the custom hook to check if the screen is small (e.g., max-width: 992px for tablets/mobiles)
  const isSmallScreen = useMediaQuery("(max-width: 992px)");

  // Effect to load the base image of the phone case (funda)
  useEffect(() => {
    if (model && model.imagen) {
      // Clean the image URL if it starts with a slash
      const cleanedModelImage = model.imagen.startsWith("/")
        ? model.imagen.substring(1)
        : model.imagen;
      // Construct the full image URL
      const imageUrl = `${process.env.PUBLIC_URL}/${cleanedModelImage}`;
      const img = new window.Image();
      img.crossOrigin = "anonymous"; // Enable cross-origin loading for images
      img.src = imageUrl;
      img.onload = () => setFundaImage(img); // Set image on successful load
      img.onerror = () => setFundaImage(null); // Handle error if image fails to load
    } else {
      setFundaImage(null); // Clear funda image if model is not provided
    }
  }, [model]); // Re-run effect when the model changes

  // Effect to load the user's uploaded image onto the Konva stage
  useEffect(() => {
    if (userImage) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = userImage;
      img.onload = () => {
        setUploadedKonvaImage(img); // Set the loaded image
        setSelectedShapeName("userImage"); // Select the user image by default
        // Calculate initial position and scale to cover the stage
        const initialProps = calculateInitialImagePropsToCover(img);
        setSelectedScale(initialProps.scale);
        setSelectedPosition({ x: initialProps.x, y: initialProps.y });
      };
      img.onerror = () => setUploadedKonvaImage(null); // Handle error
    } else {
      setUploadedKonvaImage(null); // Clear uploaded image
      // If the currently selected shape was the user image, deselect it
      if (selectedShapeName === "userImage") {
        setSelectedShapeName(null);
      }
    }
  }, [userImage]); // Re-run effect when userImage changes

  // Effect to attach the Transformer tool to the selected shape (user image or text)
  // CORRECCIÓN: Añadida 'selectedShapeName' a las dependencias del useEffect
  useEffect(() => {
    if (trRef.current) {
      trRef.current.nodes([]); // Clear any previously attached nodes
      let nodeToAttach = null;
      // Determine which node to attach the Transformer to
      if (selectedShapeName === "userImage" && userImageNodeRef.current) {
        nodeToAttach = userImageNodeRef.current;
      } else if (selectedShapeName === "userText" && userTextNodeRef.current) {
        nodeToAttach = userTextNodeRef.current;
      }
      if (nodeToAttach) {
        trRef.current.nodes([nodeToAttach]); // Attach the node
        // Update state with current properties of the attached node
        setSelectedScale(nodeToAttach.scaleX());
        setSelectedRotation(nodeToAttach.rotation());
        setSelectedPosition({ x: nodeToAttach.x(), y: nodeToAttach.y() });
      }
      trRef.current.getLayer().batchDraw(); // Redraw the layer
    }
  }, [selectedShapeName, trRef]); // Re-run effect when selectedShapeName or trRef changes

  /**
   * Calculates initial properties (scale and position) for an image
   * to cover the entire Konva stage while maintaining aspect ratio.
   * @param {Image} img The HTML Image element.
   * @returns {{scale: number, x: number, y: number}} Initial scale and centered position.
   */
  const calculateInitialImagePropsToCover = (img) => {
    const caseUsableWidth = STAGE_WIDTH;
    const caseUsableHeight = STAGE_HEIGHT;
    const imageAspectRatio = img.width / img.height;
    const targetAspectRatio = caseUsableWidth / caseUsableHeight;

    let finalScale;
    // Determine the scale needed to cover the target area
    if (imageAspectRatio > targetAspectRatio) {
      finalScale = caseUsableHeight / img.height;
    } else {
      finalScale = caseUsableWidth / img.width;
    }

    // Return the calculated scale and center position
    return { scale: finalScale, x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 };
  };

  /**
   * Calculates properties for the funda image to fit within the stage,
   * maintaining its aspect ratio.
   * @returns {object} Konva Image properties.
   */
  const getFundaImageProps = () => {
    if (!fundaImage) return {}; // Return empty object if no funda image
    const imageAspectRatio = fundaImage.width / fundaImage.height;
    const stageAspectRatio = STAGE_WIDTH / STAGE_HEIGHT;
    let newWidth, newHeight;

    // Calculate new dimensions to fit within the stage
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
      listening: true, // Enable event listening for the image
      // Apply a color filter on hover for visual feedback
      filters: isFundaHovered ? [window.Konva.Filters.RGBA] : [],
      red: isFundaHovered ? 150 : 0,
      green: isFundaHovered ? 150 : 0,
      blue: isFundaHovered ? 200 : 0,
      alpha: isFundaHovered ? 0.6 : 0,
    };
  };

  /**
   * Handles click events on the Konva stage background.
   * Deselects any active shape if the click is on the stage itself or the funda image.
   * @param {object} e Konva event object.
   */
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === "fundaImage") {
      setSelectedShapeName(null);
    }
  };

  /**
   * Handles click event on the user's uploaded image.
   * Selects the user image for transformation.
   * @param {object} e Konva event object.
   */
  const handleImageClick = (e) => {
    e.cancelBubble = true; // Stop event propagation
    setSelectedShapeName("userImage"); // Select the user image
  };

  /**
   * Handles click event on the user's added text.
   * Selects the user text for transformation.
   * @param {object} e Konva event object.
   */
  const handleTextClick = (e) => {
    e.cancelBubble = true; // Stop event propagation
    setSelectedShapeName("userText"); // Select the user text
  };

  // Handlers for funda image hover and click
  const handleFundaMouseEnter = () => setIsFundaHovered(true);
  const handleFundaMouseLeave = () => setIsFundaHovered(false);
  const handleFundaClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName(null);
    setIsFundaHovered(false);
  };

  /**
   * Handles the end of a transformation (scale, rotate) on a selected shape.
   * Updates the state with the new scale, rotation, and position.
   * @param {object} e Konva event object.
   */
  const handleTransformEnd = (e) => {
    setSelectedScale(e.target.scaleX());
    setSelectedRotation(e.target.rotation());
    setSelectedPosition({ x: e.target.x(), y: e.target.y() });
  };

  /**
   * Handles the end of a drag operation on a selected shape.
   * Updates the state with the new position.
   * @param {object} e Konva event object.
   */
  const handleDragEnd = (e) => {
    setSelectedPosition({ x: e.target.x(), y: e.target.y() });
  };

  /**
   * Handles changes to the scale input in the controls panel.
   * Applies the new scale to the selected shape.
   * @param {object} e React event object from input.
   */
  const handleSelectedScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setSelectedScale(newScale);
    // Get the currently selected Konva node
    const node =
      selectedShapeName === "userImage"
        ? userImageNodeRef.current
        : userTextNodeRef.current;
    if (node) {
      node.scale({ x: newScale, y: newScale }); // Apply scale
      node.getLayer().batchDraw(); // Redraw layer
      trRef.current?.update(); // Update transformer handles
    }
  };

  /**
   * Handles changes to the rotation input in the controls panel.
   * Applies the new rotation to the selected shape.
   * @param {object} e React event object from input.
   */
  const handleSelectedRotationChange = (e) => {
    const newRotation = parseInt(e.target.value, 10);
    setSelectedRotation(newRotation);
    // Get the currently selected Konva node
    const node =
      selectedShapeName === "userImage"
        ? userImageNodeRef.current
        : userTextNodeRef.current;
    if (node) {
      node.rotation(newRotation); // Apply rotation
      node.getLayer().batchDraw(); // Redraw layer
      trRef.current?.update(); // Update transformer handles
    }
  };

  /**
   * Moves the selected object by a given delta (dx, dy).
   * @param {number} dx Change in X position.
   * @param {number} dy Change in Y position.
   */
  const moveSelectedObject = (dx, dy) => {
    const node =
      selectedShapeName === "userImage"
        ? userImageNodeRef.current
        : userTextNodeRef.current;
    if (node) {
      node.x(node.x() + dx); // Update X position
      node.y(node.y() + dy); // Update Y position
      setSelectedPosition({ x: node.x(), y: node.y() }); // Update state
      node.getLayer().batchDraw(); // Redraw layer
      trRef.current?.update(); // Update transformer handles
    }
  };

  /**
   * Clears the user's design (removes uploaded image and text).
   * Resets selection and control panel visibility.
   */
  const handleClearDesign = () => {
    setUploadedKonvaImage(null);
    setSelectedShapeName(null);
    setSelectedScale(1);
    setSelectedRotation(0);
    setSelectedPosition({ x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 });
    // If user text exists, destroy its Konva node
    if (userTextNodeRef.current) {
      userTextNodeRef.current.destroy();
      userTextNodeRef.current = null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        // Siempre apila los elementos verticalmente
        flexDirection: "column",
        // Centra los elementos horizontalmente
        alignItems: "center",
        justifyContent: "flex-start", // Alinea el contenido a la parte superior
        position: "relative",
        padding: "0", // Padding eliminado aquí, App.js maneja el padding general
        boxSizing: "border-box",
        width: "100%", // Ocupa todo el ancho del padre
        gap: "20px", // Espacio entre Stage (funda) y ControlsPanel
      }}
    >
      {/* Konva Stage para el diseño de la funda */}
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        ref={stageRef}
        onClick={handleStageClick}
        style={{
          backgroundColor: "#f0f0f0",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Sombra sutil para profundidad
          borderRadius: "12px", // Esquinas redondeadas para el stage
          // No se necesita margin-bottom o right aquí, el 'gap' de flex maneja el espaciado
          marginBottom: "0",
          marginRight: "0",
          // Asegura que el stage sea responsivo en términos de su contenedor
          maxWidth: "100%",
          height: "auto",
        }}
      >
        <Layer>
          {/* Renderiza la imagen subida por el usuario si está disponible */}
          {uploadedKonvaImage && (
            <UserImage
              image={uploadedKonvaImage}
              position={selectedPosition}
              scale={selectedScale}
              rotation={selectedRotation}
              handleClick={handleImageClick}
              handleTransformEnd={handleTransformEnd}
              handleDragEnd={handleDragEnd}
              ref={userImageNodeRef}
            />
          )}
          {/* Renderiza el texto añadido por el usuario si está disponible */}
          {userText && (
            <UserText
              text={userText}
              position={selectedPosition}
              scale={selectedScale}
              rotation={selectedRotation}
              handleClick={handleTextClick}
              handleTransformEnd={handleTransformEnd}
              handleDragEnd={handleDragEnd}
              // Ajusta el offset para centrar el texto
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
              ref={userTextNodeRef}
            />
          )}
          {/* Renderiza la imagen base de la funda del teléfono */}
          {fundaImage && (
            <FundaImage
              fundaImageProps={getFundaImageProps()}
              handleFundaMouseEnter={handleFundaMouseEnter}
              handleFundaMouseLeave={handleFundaMouseLeave}
              handleFundaClick={handleFundaClick}
              ref={fundaKonvaImageRef}
            />
          )}
          {/* Componente Transformer de Konva para escalar, rotar y mover formas seleccionadas */}
          <Transformer ref={trRef} />
        </Layer>
      </Stage>

      {/* Panel de Controles (ahora siempre debajo de la funda) */}
      <ControlsPanel
        selectedShapeName={selectedShapeName}
        selectedScale={selectedScale}
        selectedRotation={selectedRotation}
        handleSelectedScaleChange={handleSelectedScaleChange}
        handleSelectedRotationChange={handleSelectedRotationChange}
        moveSelectedObject={moveSelectedObject}
        handleClearDesign={handleClearDesign}
        setSelectedShapeName={setSelectedShapeName}
        isSmallScreen={isSmallScreen} // Todavía se pasa isSmallScreen para ajustes menores dentro de ControlsPanel
      />
    </div>
  );
};

export default Editor;
