import React, { useState, useCallback } from 'react';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { useAffordabilityCalculator } from './hooks/useAffordabilityCalculator';
import { FormData } from './types';
import { INITIAL_FORM_DATA } from './constants';

function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const calculationResults = useAffordabilityCalculator(formData);

  const handleFormChange = useCallback((field: keyof FormData, value: any) => {
    // A bit of logic to handle the balloon percentage string from the form
    if (field === 'balloonPercentage' && typeof value === 'string') {
      value = parseInt(value.replace('%', '')) || 0;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-white text-center">
            Vehicle Finance Affordability Calculator
          </h1>
          <p className="text-center text-cyan-400 mt-1">
            An advanced tool to estimate what you can afford based on South African credit guidelines.
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="lg:col-span-1">
                  <CalculatorForm 
                      formData={formData}
                      onFormChange={handleFormChange}
                      onReset={handleReset}
                  />
              </div>
              <div className="lg:col-span-1">
                  <ResultsDisplay results={calculationResults} />
              </div>
          </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-500 border-t border-gray-800 mt-8">
          <p>&copy; {new Date().getFullYear()} Affordability Calculator. For estimation purposes only.</p>
          <p>Consult with a financial advisor for professional advice.</p>
      </footer>
    </div>
  );
}

export default App;
