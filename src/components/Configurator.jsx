// src/components/Configurator.jsx
import React, { useState } from "react";
import Step1Marca from "./steps/Step1Marca";
import Step2Modelo from "./steps/Step2Modelo";
import Step3Material from "./steps/Step3Material";
import Step4Color from "./steps/Step4Color";
import Step5Grilla from "./steps/Step5Grilla";
import Step6Personaliza from "./steps/Step6Personaliza";

const Configurator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Marca />;
      case 2:
        return <Step2Modelo />;
      case 3:
        return <Step3Material />;
      case 4:
        return <Step4Color />;
      case 5:
        return <Step5Grilla />;
      case 6:
        return <Step6Personaliza />;
      default:
        return <Step1Marca />;
    }
  };

  return (
    <div className="wizard-container">
      <div className="steps-navigation">
        <p>
          Paso {currentStep} de {totalSteps}
        </p>
        <div className="steps-buttons">
          {currentStep > 1 && <button onClick={prevStep}>◀ Anterior</button>}
          {currentStep < totalSteps && (
            <button onClick={nextStep}>Siguiente ▶</button>
          )}
        </div>
      </div>
      <div className="step-content">{renderStep()}</div>
    </div>
  );
};

export default Configurator;
