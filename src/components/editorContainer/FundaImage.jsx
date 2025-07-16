import React from "react";
import { Image as KonvaImage } from "react-konva";

const FundaImage = React.forwardRef(
  (
    {
      fundaImageProps,
      handleFundaMouseEnter,
      handleFundaMouseLeave,
      handleFundaClick,
    },
    ref
  ) => {
    return (
      <KonvaImage
        {...fundaImageProps}
        name="fundaImage"
        onMouseEnter={handleFundaMouseEnter}
        onMouseLeave={handleFundaMouseLeave}
        onClick={handleFundaClick}
        onTap={handleFundaClick}
        ref={ref}
      />
    );
  }
);

export default FundaImage;
