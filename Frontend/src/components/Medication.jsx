import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const GEMINI_API_KEY = "AIzaSyD0fejsw91tyOzRRzob1Zcu0KX0QCzVlPA";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Fix linter error by using motion components explicitly
const MotionDiv = motion.div;
const MotionButton = motion.button;

const Medication = ({ prescriptions, setPrescriptions }) => {
  // State for pill detection
  const [showCamera, setShowCamera] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pillDetectionResults, setPillDetectionResults] = useState(null);
  const [isIdentifyingPill, setIsIdentifyingPill] = useState(false);
  
  // Refs
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Capture image from webcam
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setScannedImage(imageSrc);
    setShowCamera(false);
    processImage(imageSrc);
  };
  
  // Handle file upload for prescription image
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScannedImage(event.target.result);
        processImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Process the image with OCR and then AI
  const processImage = async (imageData) => {
    setIsProcessing(true);
    try {
      // Use Tesseract.js for OCR
      const result = await Tesseract.recognize(imageData, 'eng');
      const text = result.data.text;
      
      // Basic parsing of medication info from text
      const prescriptionInfo = parsePrescriptionText(text);
      
      setScanResults({
        text,
        ...prescriptionInfo
      });
      
      // Use Gemini API for pill identification
      await identifyPillWithGemini(imageData, prescriptionInfo);
      
    } catch (error) {
      console.error("Error processing image:", error);
      setScanResults({ error: "Failed to process image. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Parse prescription text to extract information
  const parsePrescriptionText = (text) => {
    const lowerText = text.toLowerCase();
    
    // Very basic parsing for demonstration
    const info = {
      name: null,
      dosage: null,
      schedule: null,
      type: null
    };
    
    // Extract possible medication name
    const nameMatch = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+\d+\s*mg/i);
    if (nameMatch) info.name = nameMatch[1];
    
    // Extract dosage
    const dosageMatch = text.match(/(\d+\s*mg|\d+\s*mcg|\d+\s*ml)/i);
    if (dosageMatch) info.dosage = dosageMatch[0];
    
    // Extract schedule
    if (lowerText.includes('daily') || lowerText.includes('once a day')) {
      info.schedule = 'Once daily';
    } else if (lowerText.includes('twice') || lowerText.includes('two times')) {
      info.schedule = 'Twice daily';
    } else if (lowerText.includes('as needed') || lowerText.includes('prn')) {
      info.schedule = 'As needed';
    }
    
    return info;
  };
  
  // Identify pill using Gemini AI
  const identifyPillWithGemini = async (imageData, prescriptionInfo) => {
    try {
      setIsIdentifyingPill(true);
      
      // Remove data URL prefix to get just the base64 data for Gemini API
      let base64Image = imageData;
      if (imageData.startsWith('data:image')) {
        base64Image = imageData.split(',')[1];
      }
      
      // Get the Gemini Pro Vision model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Create a prompt that includes any text we've extracted
      let prompt = "Identify this medication or prescription in the image. ";
      
      if (prescriptionInfo && prescriptionInfo.name) {
        prompt += `I think it might be ${prescriptionInfo.name}. `;
      }
      
      prompt += "Provide a detailed response with the following information: " +
               "1. Drug name (generic and brand names) " +
               "2. Typical dosage " +
               "3. What it's used for " +
               "4. When it should be taken " +
               "5. Important precautions " +
               "6. Common side effects " +
               "7. What the pill looks like (if visible)";
      
      // Call the Gemini API with the image
      console.log("Calling Gemini API...");
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg"
          }
        }
      ]);
      
      // Get the response text
      const responseText = result.response.text();
      console.log("Gemini API response:", responseText);
      
      // Parse the response to extract structured information
      // This is a simplified parser that now better formats the pill data
      const parseGeminiResponse = (text) => {
        // Clean and format the response
        const getCleanResponse = (field, content) => {
          // First, remove any field labels that might be in the content
          let cleaned = content;
          const commonLabels = [
            "drug name", "name", "generic name", "brand names", 
            "appearance", "what the pill looks like", 
            "dosage", "typical dosage", 
            "schedule", "when it should be taken", 
            "type", "medication type", "classification",
            "used for", "what it's used for", "usage",
            "side effects", "common side effects",
            "precautions", "important precautions"
          ];
          
          // Remove redundant prefixes
          commonLabels.forEach(label => {
            const regex = new RegExp(`^(${label})[:\\s-]*`, 'i');
            cleaned = cleaned.replace(regex, '');
          });
          
          // Clean up bullets and excess formatting
          cleaned = cleaned.replace(/^\*+\s*/gm, '');
          cleaned = cleaned.replace(/^\s*•\s*/gm, '');
          
          return cleaned.trim();
        };
        
        // Default values
        const parsedResponse = {
          pillName: extractValue(text, ["drug name", "medication", "name"]) || prescriptionInfo.name || "Unknown medication",
          appearance: extractValue(text, ["looks like", "appearance", "pill description", "tablet"]) || "Not specified",
          dosage: extractValue(text, ["dosage", "dose", "mg", "milligram"]) || prescriptionInfo.dosage || "Standard dosage (consult your doctor)",
          schedule: extractValue(text, ["taken", "schedule", "frequency", "timing"]) || prescriptionInfo.schedule || "As prescribed by your doctor",
          type: extractValue(text, ["type", "classification", "category"]) || prescriptionInfo.type || "Medication",
          usage: extractValue(text, ["used for", "treats", "treatment", "indication"]) || "Consult your doctor for usage information",
          sideEffects: extractValue(text, ["side effects", "adverse effects", "adverse reactions"]) || "Various side effects may occur. Consult your doctor.",
          precautions: extractValue(text, ["precautions", "warnings", "caution"]) || "Take as directed by your healthcare provider."
        };
        
        // Clean up each field
        Object.keys(parsedResponse).forEach(key => {
          if (parsedResponse[key]) {
            parsedResponse[key] = getCleanResponse(key, parsedResponse[key]);
          }
        });
        
        return parsedResponse;
      };
      
      // Helper function to extract values from text
      const extractValue = (text, keywords) => {
        const sentences = text.split(/[.!?]\s+/);
        
        for (const keyword of keywords) {
          const matchingSentences = sentences.filter(s => 
            s.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (matchingSentences.length > 0) {
            return matchingSentences[0].trim();
          }
        }
        
        return null;
      };
      
      // Parse the response
      const geminiResponse = parseGeminiResponse(responseText);
      setPillDetectionResults(geminiResponse);
      
    } catch (error) {
      console.error("Gemini API error:", error);
      setScanResults({ error: "Failed to analyze image with AI. Please try again or enter details manually." });
    } finally {
      setIsIdentifyingPill(false);
    }
  };

  // Add a function to handle adding the detected medication to prescriptions
  const handleAddToPrescriptions = () => {
    if (!pillDetectionResults) return;
    
    const newPrescription = {
      id: prescriptions.length + 1,
      name: pillDetectionResults.pillName,
      dosage: pillDetectionResults.dosage,
      schedule: pillDetectionResults.schedule,
      type: pillDetectionResults.type,
      appearance: pillDetectionResults.appearance,
      usage: pillDetectionResults.usage,
      sideEffects: pillDetectionResults.sideEffects,
      precautions: pillDetectionResults.precautions
    };
    
    setPrescriptions([...prescriptions, newPrescription]);
    
    // Clear the detection results after adding
    setPillDetectionResults(null);
    setScannedImage(null);
  };

  // Add these functions for medication management
  const handleDeleteMedication = (id) => {
    setPrescriptions(prescriptions.filter(med => med.id !== id));
  };
  
  const handleEditMedication = (id) => {
    // This would open an edit form in a real implementation
    // For now, we'll just log it
    console.log("Edit medication:", id);
    // In real implementation, you could set a state to show a modal or form for editing
  };
  
  return (
    <div className="space-y-4 h-full">
      <h2 className="text-xl font-semibold text-gray-800">Medication Tracker</h2>
      
      {/* Prescription Scanner Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-medium mb-4">Pill & Prescription Scanner</h3>
        <p className="text-sm text-gray-600 mb-4">
          Scan your pill or prescription using your camera or upload an image. 
          Our AI will identify the medication and suggest appropriate dosage and timing.
        </p>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <MotionButton
            onClick={() => {
              setShowCamera(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">📷</span> Scan Pill/Prescription
          </MotionButton>
          
          <MotionButton
            onClick={() => fileInputRef.current.click()}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">📁</span> Upload Pill/Prescription Image
          </MotionButton>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        {/* Camera View */}
        {showCamera && (
          <MotionDiv
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "environment"
                }}
              />
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <MotionButton
                  onClick={captureImage}
                  className="bg-red-500 text-white px-6 py-2 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Capture
                </MotionButton>
              </div>
            </div>
          </MotionDiv>
        )}
        
        {/* Scanned Image Preview */}
        {scannedImage && !showCamera && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Scanned Image</h4>
            <div className="relative">
              <img src={scannedImage} alt="Scanned" className="w-full max-h-64 object-contain rounded-lg" />
              {(isProcessing || isIdentifyingPill) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg">
                  <div className="text-white mb-2">
                    {isProcessing ? "Processing text..." : "Identifying pill with AI..."}
                  </div>
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Pill Detection Results */}
        {pillDetectionResults && !isProcessing && !isIdentifyingPill && (
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-blue-200 bg-blue-50 rounded-lg mb-4"
          >
            <h4 className="font-medium mb-3 text-blue-800">AI Pill Identification Results</h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="font-medium w-32">Name:</span> 
                <span>{pillDetectionResults.pillName}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Appearance:</span> 
                <span>{pillDetectionResults.appearance}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Dosage:</span> 
                <span>{pillDetectionResults.dosage}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Schedule:</span> 
                <span>{pillDetectionResults.schedule}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Type:</span> 
                <span>{pillDetectionResults.type}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Used for:</span> 
                <span>{pillDetectionResults.usage}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Side effects:</span> 
                <span>{pillDetectionResults.sideEffects}</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">Precautions:</span> 
                <span>{pillDetectionResults.precautions}</span>
              </div>
            </div>
            <MotionButton
              onClick={handleAddToPrescriptions}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">➕</span> Add to Medications
            </MotionButton>
          </MotionDiv>
        )}
        
        {/* Text OCR Results (keep as fallback) */}
        {scanResults && !scanResults.error && !pillDetectionResults && !isProcessing && !isIdentifyingPill && (
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border border-gray-200 rounded-lg mb-4"
          >
            <h4 className="font-medium mb-2">Detected Medication Details (Text Only)</h4>
            <div className="space-y-1">
              <p><span className="font-medium">Name:</span> {scanResults.name || 'Not detected'}</p>
              <p><span className="font-medium">Dosage:</span> {scanResults.dosage || 'Not detected'}</p>
              <p><span className="font-medium">Schedule:</span> {scanResults.schedule || 'Not detected'}</p>
              <p><span className="font-medium">Type:</span> {scanResults.type || 'Not detected'}</p>
            </div>
          </MotionDiv>
        )}
        
        {/* Error message */}
        {scanResults && scanResults.error && (
          <p className="text-red-500 mb-4">{scanResults.error}</p>
        )}
      </div>
      
      {/* Medication list and schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MotionDiv
          className="bg-white p-4 rounded-lg shadow"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h3 className="font-medium mb-3">Current Medications</h3>
          {prescriptions.length === 0 ? (
            <p className="text-gray-500">No medications added yet. Scan a pill or prescription to get started.</p>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((med, index) => (
                <MotionDiv
                  key={med.id}
                  className="p-3 border border-gray-100 rounded-lg"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{med.name}</p>
                      <p className="text-sm text-gray-700">{med.dosage} • {med.type}</p>
                      <p className="text-sm text-gray-600 mt-1">Schedule: {med.schedule}</p>
                      
                      {med.appearance && (
                        <p className="text-xs text-gray-500 mt-1">Appearance: {med.appearance}</p>
                      )}
                      
                      {med.usage && (
                        <p className="text-sm text-gray-600 mt-1">Used for: {med.usage}</p>
                      )}
                      
                      {med.sideEffects && (
                        <p className="text-xs text-gray-500 mt-1">Side effects: {med.sideEffects}</p>
                      )}
                      
                      {med.precautions && (
                        <p className="text-xs text-gray-500 mt-1">Precautions: {med.precautions}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditMedication(med.id)}
                        className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Edit medication"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteMedication(med.id)}
                        className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Delete medication"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>
          )}
        </MotionDiv>
        
        <MotionDiv
          className="bg-white p-4 rounded-lg shadow"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h3 className="font-medium mb-3">Medication Schedule</h3>
          <div className="space-y-2">
            {prescriptions.some(med => med.schedule.toLowerCase().includes('morning')) && (
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex justify-between">
                  <p className="font-medium">Morning Medications</p>
                  <span className="text-sm">8:00 AM</span>
                </div>
                {prescriptions
                  .filter(med => med.schedule.toLowerCase().includes('morning'))
                  .map(med => (
                    <div key={med.id} className="mt-2">
                      <p className="text-sm font-medium">{med.name} {med.dosage}</p>
                      {med.precautions && (
                        <p className="text-xs text-gray-600">Note: {med.precautions}</p>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
            
            {prescriptions.some(med => med.schedule.toLowerCase().includes('evening') || med.schedule.toLowerCase().includes('bedtime')) && (
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex justify-between">
                  <p className="font-medium">Evening Medications</p>
                  <span className="text-sm">10:00 PM</span>
                </div>
                {prescriptions
                  .filter(med => med.schedule.toLowerCase().includes('evening') || med.schedule.toLowerCase().includes('bedtime'))
                  .map(med => (
                    <div key={med.id} className="mt-2">
                      <p className="text-sm font-medium">{med.name} {med.dosage}</p>
                      {med.precautions && (
                        <p className="text-xs text-gray-600">Note: {med.precautions}</p>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
            
            {prescriptions.some(med => med.schedule.toLowerCase().includes('as needed')) && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between">
                  <p className="font-medium">As Needed Medications</p>
                </div>
                {prescriptions
                  .filter(med => med.schedule.toLowerCase().includes('as needed'))
                  .map(med => (
                    <div key={med.id} className="mt-2">
                      <p className="text-sm font-medium">{med.name} {med.dosage}</p>
                      {med.usage && (
                        <p className="text-xs text-gray-600">For: {med.usage}</p>
                      )}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default Medication;
