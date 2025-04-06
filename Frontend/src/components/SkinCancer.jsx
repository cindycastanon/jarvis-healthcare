import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const GEMINI_API_KEY = "AIzaSyD0fejsw91tyOzRRzob1Zcu0KX0QCzVlPA";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Fix linter error by using motion components explicitly
const MotionDiv = motion.div;
const MotionButton = motion.button;

// Simplified skin lesion types with descriptions
const skinLesionTypes = {
  'malignant': {
    description: 'A potentially cancerous skin lesion that requires medical attention.',
    risk: 'High risk, requires immediate medical attention.',
    appearance: 'May have asymmetrical shape, irregular borders, varying colors, diameter larger than 6mm, or evolving features.',
    action: 'Consult a dermatologist immediately for proper diagnosis and treatment.'
  },
  'benign': {
    description: 'A non-cancerous skin growth that does not pose a significant health risk.',
    risk: 'Low risk, but monitor for changes.',
    appearance: 'Typically uniform in color and shape with regular borders.',
    action: 'Monitor for changes in size, color, or shape. Consult a dermatologist if changes occur.'
  }
};

const SkinCancer = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Capture image from webcam
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowCamera(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze skin lesion image using Gemini Vision Pro
  const analyzeSkinImage = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // Remove data URL prefix to get just the base64 data for Gemini API
      let base64Image = capturedImage;
      if (capturedImage.startsWith('data:image')) {
        base64Image = capturedImage.split(',')[1];
      }
      
      // Get the Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Create a simplified prompt with detailed instructions for skin lesion assessment
      const prompt = `
You are a dermatology assessment tool analyzing an image of a skin lesion to help detect potential skin cancer. 
Analyze this image and provide a structured assessment.

For this assessment:
1. Describe the visual features (color, borders, symmetry, texture, size if estimable)
2. Classify the lesion as either:
   - Malignant (potentially cancerous)
   - Benign (non-cancerous)
3. Provide a confidence level (low, moderate, high)
4. List typical features that led to this classification
5. Recommend appropriate next steps

Base your assessment on the ABCDE criteria:
- Asymmetry: Are both halves of the lesion similar?
- Border: Are the edges regular or irregular?
- Color: Is the color uniform or varied?
- Diameter: Does it appear larger than 6mm?
- Evolving: Based on appearance, does it look like it might be changing?

IMPORTANT WARNINGS:
- Clearly state this is NOT a medical diagnosis
- Advise that accurate diagnosis requires in-person examination by a dermatologist
- Emphasize that early detection and medical consultation are essential for skin concerns

Be VERY clear and explicit about your classification (malignant or benign) by stating it directly.

Format your response in a structured way with clear headings for each section.
`;
      
      // Call the Gemini API with the image
      console.log("Calling Gemini API for skin analysis...");
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
      const responseText = result.response.text().trim();
      console.log("AI Response:", responseText);
      
      // Determine if the lesion is malignant or benign based on the response
      let detectedType = 'benign'; // Default to benign
      
      // Look for explicit classification statements first
      const classificationMatch = responseText.match(/classification:?\s*(malignant|benign)/i) || 
                              responseText.match(/appears to be (malignant|benign)/i) ||
                              responseText.match(/likely (malignant|benign)/i) ||
                              responseText.match(/assessment:?\s*(malignant|benign)/i);
                              
      if (classificationMatch) {
        // Use the explicit classification if found
        detectedType = classificationMatch[1].toLowerCase();
        console.log("Detected explicit classification:", detectedType);
      } else {
        // Fall back to keyword analysis
        const malignantKeywords = ['malignant', 'cancerous', 'melanoma', 'carcinoma', 'concerning'];
        const benignKeywords = ['benign', 'non-cancerous', 'normal', 'common', 'typical', 'harmless'];
        
        // Count occurrences of keywords
        let malignantScore = 0;
        let benignScore = 0;
        
        malignantKeywords.forEach(keyword => {
          const matches = responseText.toLowerCase().match(new RegExp(keyword, 'g'));
          if (matches) malignantScore += matches.length;
        });
        
        benignKeywords.forEach(keyword => {
          const matches = responseText.toLowerCase().match(new RegExp(keyword, 'g'));
          if (matches) benignScore += matches.length;
        });
        
        console.log("Keyword analysis - Malignant score:", malignantScore, "Benign score:", benignScore);
        
        // Check for statements that negate certain terms
        if (responseText.toLowerCase().includes('not malignant') || 
            responseText.toLowerCase().includes('not cancerous') ||
            responseText.toLowerCase().includes('unlikely to be malignant')) {
          benignScore += 2;
          malignantScore = Math.max(0, malignantScore - 2);
        }
        
        if (responseText.toLowerCase().includes('not benign') || 
            responseText.toLowerCase().includes('unlikely to be benign')) {
          malignantScore += 2;
          benignScore = Math.max(0, benignScore - 2);
        }
        
        // Determine final classification based on scores
        detectedType = (malignantScore > benignScore) ? 'malignant' : 'benign';
        console.log("Final classification based on keyword analysis:", detectedType);
      }
      
      // Extract confidence level
      let confidence = 'unknown';
      if (responseText.toLowerCase().includes('confidence: high') || 
          responseText.toLowerCase().includes('high confidence')) {
        confidence = 'high';
      } else if (responseText.toLowerCase().includes('confidence: moderate') || 
                 responseText.toLowerCase().includes('moderate confidence')) {
        confidence = 'moderate';
      } else if (responseText.toLowerCase().includes('confidence: low') || 
                 responseText.toLowerCase().includes('low confidence')) {
        confidence = 'low';
      }
      
      // Set the analysis results
      setAnalysisResults({
        aiResponse: responseText,
        detectedType: detectedType,
        confidence: confidence,
        typeInfo: skinLesionTypes[detectedType]
      });
      
    } catch (error) {
      console.error("Error analyzing skin image:", error);
      setAnalysisResults({ 
        error: "Failed to analyze the image. Please try again or consult a dermatologist for proper evaluation."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Reset the analysis and image
  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResults(null);
  };
  
  return (
    <div className="space-y-4 h-full">
      <h2 className="text-xl font-semibold text-gray-800">Skin Lesion Screening</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload or capture an image of a concerning skin lesion for AI-assisted analysis.
        <span className="font-bold text-red-600 ml-2">
          This is not a medical diagnosis. Always consult a dermatologist.
        </span>
      </p>
      
      {!capturedImage ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-3 mb-4">
            <MotionButton
              onClick={() => setShowCamera(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">📷</span> Capture Image
            </MotionButton>
            
            <MotionButton
              onClick={() => fileInputRef.current.click()}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">📁</span> Upload Image
            </MotionButton>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
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
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800">ABCDE Rule for Skin Cancer</h3>
            <p className="text-sm text-yellow-700 mb-2">When taking a photo, ensure the lesion is:</p>
            <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
              <li><strong>A</strong>symmetry: Capture the entire lesion to show if both halves look different</li>
              <li><strong>B</strong>order: Show if the edges are irregular, ragged, or blurred</li>
              <li><strong>C</strong>olor: Ensure the image shows the true colors of the lesion</li>
              <li><strong>D</strong>iameter: Include a reference for size if possible</li>
              <li><strong>E</strong>volving: Take multiple photos over time if the lesion is changing</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Skin Lesion Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Captured Image:</p>
              <img 
                src={capturedImage} 
                alt="Skin lesion" 
                className="w-full rounded-lg object-contain max-h-64 border border-gray-200" 
              />
            </div>
            
            <div>
              {!analysisResults && !isAnalyzing && (
                <div className="flex flex-col h-full justify-center items-center">
                  <p className="text-gray-600 mb-4">Ready to analyze this image?</p>
                  <div className="flex space-x-2">
                    <MotionButton
                      onClick={analyzeSkinImage}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Analyze Image
                    </MotionButton>
                    <MotionButton
                      onClick={handleReset}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reset
                    </MotionButton>
                  </div>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="flex flex-col h-full justify-center items-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Analyzing skin lesion... This may take a moment.</p>
                </div>
              )}
              
              {analysisResults && !analysisResults.error && !isAnalyzing && (
                <div className="h-full">
                  <h3 className="font-semibold text-lg mb-2">
                    Detection Results
                  </h3>
                  <div className={`p-3 rounded-lg mb-3 ${
                    analysisResults.detectedType === 'malignant' ? 'bg-red-100 border-red-400 border' : 'bg-green-100 border-green-400 border'
                  }`}>
                    <p className="font-semibold">
                      {analysisResults.detectedType === 'malignant' ? 
                        '⚠️ Potentially Malignant (Cancerous) Lesion' :
                        '✓ Potentially Benign (Non-Cancerous) Lesion'
                      }
                    </p>
                    <p className="text-sm mt-1">
                      Confidence: {analysisResults.confidence === 'high' ? 'High' : 
                                  analysisResults.confidence === 'moderate' ? 'Moderate' : 
                                  analysisResults.confidence === 'low' ? 'Low' : 'Unknown'}
                    </p>
                    <p className="text-sm mt-1">{analysisResults.typeInfo.risk}</p>
                  </div>
                  
                  <div className="text-sm space-y-2 mb-3">
                    <p><strong>Description:</strong> {analysisResults.typeInfo.description}</p>
                    <p><strong>Typical Appearance:</strong> {analysisResults.typeInfo.appearance}</p>
                    <p><strong>Recommended Action:</strong> {analysisResults.typeInfo.action}</p>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <MotionButton
                      onClick={handleReset}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Scan Another Image
                    </MotionButton>
                  </div>
                </div>
              )}
              
              {analysisResults && analysisResults.error && (
                <div className="flex flex-col h-full justify-center">
                  <p className="text-red-600 mb-4">{analysisResults.error}</p>
                  <div className="flex space-x-2">
                    <MotionButton
                      onClick={handleReset}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Again
                    </MotionButton>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {analysisResults && !analysisResults.error && !isAnalyzing && (
            <div className="p-4 bg-gray-50 rounded-lg mt-4">
              <h4 className="font-medium mb-2">AI Analysis Details</h4>
              <div className="text-sm whitespace-pre-line">
                {analysisResults.aiResponse}
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <strong>IMPORTANT DISCLAIMER:</strong> This analysis is not a medical diagnosis. The AI provides suggestions based on the image only. 
                Always consult with a qualified dermatologist for proper diagnosis and treatment of skin conditions. 
                Early detection and professional medical advice are essential for skin health.
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Educational Information */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">About Skin Cancer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Risk Factors</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Fair skin, light hair or eye color</li>
              <li>History of sunburns, excessive sun exposure</li>
              <li>Family or personal history of skin cancer</li>
              <li>Multiple moles or atypical moles</li>
              <li>Weakened immune system</li>
              <li>Exposure to radiation or certain substances</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Prevention Tips</h4>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Apply sunscreen daily (SPF 30+)</li>
              <li>Avoid peak sun hours (10 AM - 4 PM)</li>
              <li>Wear protective clothing, hats, sunglasses</li>
              <li>Avoid tanning beds and sun lamps</li>
              <li>Perform regular skin self-exams</li>
              <li>See a dermatologist yearly for skin checks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinCancer;