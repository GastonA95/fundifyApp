import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import FundaImage from "./FundaImage";
import UserImage from "./UserImage";
import UserText from "./UserText";
import ControlsPanel from "./ControlsPanel";

const Editor = ({ model, userImage, userText }) => {
  const [fundaImage, setFundaImage] = useState(null);
  const [uploadedKonvaImage, setUploadedKonvaImage] = useState(null);
  const [selectedShapeName, setSelectedShapeName] = useState(null);
  const [showFundaControls, setShowFundaControls] = useState(false);
  const [isFundaHovered, setIsFundaHovered] = useState(false);
  const [selectedScale, setSelectedScale] = useState(1);
  const [selectedRotation, setSelectedRotation] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState({ x: 0, y: 0 });

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const fundaKonvaImageRef = useRef(null);
  const userImageNodeRef = useRef(null);
  const userTextNodeRef = useRef(null);

  const STAGE_WIDTH = 300;
  const STAGE_HEIGHT = 600;

  // Cargar imagen de la funda
  useEffect(() => {
    if (model && model.imagen) {
      const cleanedModelImage = model.imagen.startsWith("/")
        ? model.imagen.substring(1)
        : model.imagen;
      const imageUrl = `${process.env.PUBLIC_URL}/${cleanedModelImage}`;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => setFundaImage(img);
      img.onerror = () => setFundaImage(null);
    } else {
      setFundaImage(null);
    }
  }, [model]);

  // Cargar imagen del usuario
  useEffect(() => {
    if (userImage) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = userImage;
      img.onload = () => {
        setUploadedKonvaImage(img);
        setSelectedShapeName("userImage");
        const initialProps = calculateInitialImagePropsToCover(img);
        setSelectedScale(initialProps.scale);
        setSelectedPosition({ x: initialProps.x, y: initialProps.y });
      };
      img.onerror = () => setUploadedKonvaImage(null);
    } else {
      setUploadedKonvaImage(null);
      if (selectedShapeName === "userImage") {
        setSelectedShapeName(null);
      }
    }
  }, [userImage]);

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

  const calculateInitialImagePropsToCover = (img) => {
    const caseUsableWidth = STAGE_WIDTH;
    const caseUsableHeight = STAGE_HEIGHT;
    const imageAspectRatio = img.width / img.height;
    const targetAspectRatio = caseUsableWidth / caseUsableHeight;

    let finalScale;
    if (imageAspectRatio > targetAspectRatio) {
      finalScale = caseUsableHeight / img.height;
    } else {
      finalScale = caseUsableWidth / img.width;
    }

    return { scale: finalScale, x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 };
  };

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
      filters: isFundaHovered ? [window.Konva.Filters.RGBA] : [],
      red: isFundaHovered ? 150 : 0,
      green: isFundaHovered ? 150 : 0,
      blue: isFundaHovered ? 200 : 0,
      alpha: isFundaHovered ? 0.6 : 0,
    };
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === "fundaImage") {
      setSelectedShapeName(null);
      setShowFundaControls(
        e.target.name() === "fundaImage" || !selectedShapeName
      );
    }
  };

  const handleImageClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName("userImage");
    setShowFundaControls(true);
  };

  const handleTextClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName("userText");
    setShowFundaControls(true);
  };

  const handleFundaMouseEnter = () => setIsFundaHovered(true);
  const handleFundaMouseLeave = () => setIsFundaHovered(false);
  const handleFundaClick = (e) => {
    e.cancelBubble = true;
    setSelectedShapeName(null);
    setShowFundaControls(true);
    setIsFundaHovered(false);
  };

  const handleTransformEnd = (e) => {
    setSelectedScale(e.target.scaleX());
    setSelectedRotation(e.target.rotation());
    setSelectedPosition({ x: e.target.x(), y: e.target.y() });
  };

  const handleDragEnd = (e) => {
    setSelectedPosition({ x: e.target.x(), y: e.target.y() });
  };

  const handleSelectedScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setSelectedScale(newScale);
    const node =
      selectedShapeName === "userImage"
        ? userImageNodeRef.current
        : userTextNodeRef.current;
    if (node) {
      node.scale({ x: newScale, y: newScale });
      node.getLayer().batchDraw();
      trRef.current?.update();
    }
  };

  const handleSelectedRotationChange = (e) => {
    const newRotation = parseInt(e.target.value, 10);
    setSelectedRotation(newRotation);
    const node =
      selectedShapeName === "userImage"
        ? userImageNodeRef.current
        : userTextNodeRef.current;
    if (node) {
      node.rotation(newRotation);
      node.getLayer().batchDraw();
      trRef.current?.update();
    }
  };

  const moveSelectedObject = (dx, dy) => {
    const node =
      selectedShapeName === "userImage"
        ? userImageNodeRef.current
        : userTextNodeRef.current;
    if (node) {
      node.x(node.x() + dx);
      node.y(node.y() + dy);
      setSelectedPosition({ x: node.x(), y: node.y() });
      node.getLayer().batchDraw();
      trRef.current?.update();
    }
  };

  const handleClearDesign = () => {
    setUploadedKonvaImage(null);
    setSelectedShapeName(null);
    setShowFundaControls(false);
    setSelectedScale(1);
    setSelectedRotation(0);
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
        onClick={handleStageClick}
        style={{ backgroundColor: "#f0f0f0" }}
      >
        <Layer>
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
          {userText && (
            <UserText
              text={userText}
              position={selectedPosition}
              scale={selectedScale}
              rotation={selectedRotation}
              handleClick={handleTextClick}
              handleTransformEnd={handleTransformEnd}
              handleDragEnd={handleDragEnd}
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
          {fundaImage && (
            <FundaImage
              fundaImageProps={getFundaImageProps()}
              handleFundaMouseEnter={handleFundaMouseEnter}
              handleFundaMouseLeave={handleFundaMouseLeave}
              handleFundaClick={handleFundaClick}
              ref={fundaKonvaImageRef}
            />
          )}
          <Transformer ref={trRef} />
        </Layer>
      </Stage>
      {showFundaControls && (
        <ControlsPanel
          selectedShapeName={selectedShapeName}
          selectedScale={selectedScale}
          selectedRotation={selectedRotation}
          handleSelectedScaleChange={handleSelectedScaleChange}
          handleSelectedRotationChange={handleSelectedRotationChange}
          moveSelectedObject={moveSelectedObject}
          handleClearDesign={handleClearDesign}
          setSelectedShapeName={setSelectedShapeName}
        />
      )}
    </div>
  );
};

export default Editor;
