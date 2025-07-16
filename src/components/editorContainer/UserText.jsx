import React from "react";
import { Text as KonvaText } from "react-konva";

const UserText = React.forwardRef(
  (
    {
      text,
      position,
      scale,
      rotation,
      handleClick,
      handleTransformEnd,
      handleDragEnd,
      offsetX,
      offsetY,
    },
    ref
  ) => (
    <KonvaText
      text={text}
      fontSize={30}
      fill="black"
      x={position.x + 20}
      y={position.y + 20}
      offsetX={offsetX}
      offsetY={offsetY}
      draggable
      name="userText"
      onClick={handleClick}
      onTap={handleClick}
      onTransformEnd={handleTransformEnd}
      onDragEnd={handleDragEnd}
      ref={ref}
      scaleX={scale}
      scaleY={scale}
      rotation={rotation}
    />
  )
);

export default UserText;
