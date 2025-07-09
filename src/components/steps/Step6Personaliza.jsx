// src/components/steps/Step6Personaliza.jsx
import React, { useEffect } from "react";
import { Canvas, Image, Textbox } from "fabric";

const Step6Personaliza = () => {
  useEffect(() => {
    const canvas = new Canvas("designer-canvas");

    document.getElementById("imgLoader").addEventListener("change", (e) => {
      const reader = new FileReader();
      reader.onload = (f) => {
        Image.fromURL(f.target.result, (fImg) => {
          fImg.scaleToWidth(200);
          canvas.add(fImg);
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    });

    window.fundifyAddText = () => {
      const text = new Textbox("Tu texto aquí", {
        left: 50,
        top: 50,
        width: 200,
        fontSize: 20,
        fill: "#000",
      });
      canvas.add(text);
    };

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>6. Personalizá tu funda</h3>
      <canvas
        id="designer-canvas"
        width="300"
        height="500"
        style={{ border: "1px solid #ccc" }}
      />
      <br />
      <input id="imgLoader" type="file" />
      <br />
      <br />
      <button onClick={() => window.fundifyAddText()}>Agregar Texto</button>
    </div>
  );
};

export default Step6Personaliza;
