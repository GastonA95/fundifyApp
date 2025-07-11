import React from "react";
import { Image as KonvaImage } from "react-konva";

const UserImage = React.forwardRef(
  (
    {
      image,
      position,
      scale,
      rotation,
      handleClick,
      handleTransformEnd,
      handleDragEnd,
    },
    ref
  ) => (
    <KonvaImage
      image={image}
      x={position.x}
      y={position.y}
      width={image.width}
      height={image.height}
      scaleX={scale}
      scaleY={scale}
      rotation={rotation}
      offsetX={image.width / 2}
      offsetY={image.height / 2}
      draggable
      name="userImage"
      onClick={handleClick}
      onTap={handleClick}
      onTransformEnd={handleTransformEnd}
      onDragEnd={handleDragEnd}
      ref={ref}
    />
  )
);

export default UserImage;
