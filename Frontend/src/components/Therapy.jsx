import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const GEMINI_API_KEY = "AIzaSyD0fejsw91tyOzRRzob1Zcu0KX0QCzVlPA";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Fix linter error by using motion components explicitly
const MotionDiv = motion.div;
const MotionButton = motion.button;

const Therapy = () => {
  const [therapyDialog, setTherapyDialog] = useState([
    { speaker: 'assistant', text: 'Hello! I\'m your virtual therapist. How are you feeling today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [speakResponses, setSpeakResponses] = useState(false); // Default to not speaking
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { transcript, resetTranscript } = useSpeechRecognition();
  const speechSupported = SpeechRecognition.browserSupportsSpeechRecognition();
  
  // Advanced therapy response system using Gemini API
  const handleTherapyInput = async (text) => {
    // Add user message to dialog
    setTherapyDialog([
      ...therapyDialog, 
      { speaker: 'user', text }
    ]);
    
    // Reset input field
    setUserInput('');
    setIsProcessing(true);
    
    try {
      // Get chat history to provide context
      const chatHistory = therapyDialog.map(msg => 
        `${msg.speaker === 'assistant' ? 'Therapist' : 'User'}: ${msg.text}`
      ).join('\n');
      
      // Create the prompt for Gemini
      const prompt = `
You are an empathetic and helpful AI therapist speaking with a user about their mental health.
Your responses should be compassionate, professional, and therapeutic.
You should focus on providing emotional support, validation, and appropriate coping strategies.

IMPORTANT GUIDELINES:
- Keep responses concise (1-3 sentences)
- Never claim to be a licensed therapist or medical professional
- Do not attempt to diagnose conditions
- Suggest professional help when appropriate
- Focus on evidence-based approaches like CBT, mindfulness, and positive psychology
- Be especially helpful for anxiety, depression, and stress
- Maintain a warm, encouraging tone

Previous conversation:
${chatHistory}

User: ${text}

Therapist:`;

      // Call the Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Add AI response to dialog
      setTherapyDialog(current => [
        ...current, 
        { speaker: 'assistant', text: response }
      ]);
      
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback response in case of API error
      setTherapyDialog(current => [
        ...current, 
        { speaker: 'assistant', text: "I'm sorry, I'm having trouble processing right now. Could you try again or rephrase what you're feeling?" }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle voice input for therapy
  const handleVoiceTherapyInput = () => {
    if (transcript && transcript.trim() !== '') {
      handleTherapyInput(transcript);
      resetTranscript();
    }
  };
  
  // Speak function to read assistant responses aloud
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'en-US';
      speech.volume = 1;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  };
  
  // Only speak assistant responses if enabled
  useEffect(() => {
    if (!speakResponses) return; // Skip if speaking is disabled
    
    const lastMessage = therapyDialog[therapyDialog.length - 1];
    if (lastMessage && lastMessage.speaker === 'assistant') {
      speak(lastMessage.text);
    }
  }, [therapyDialog, speakResponses]);
  
  return (
    <div className="space-y-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800">AI Therapy Assistant</h2>
      <p className="text-sm text-gray-600">Talk to our AI therapist about depression, anxiety, stress, or any mental health concerns.</p>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {therapyDialog.map((message, index) => (
            <MotionDiv
              key={index}
              className={`mb-3 ${
                message.speaker === 'user' 
                  ? 'ml-auto mr-2 bg-blue-500 text-white' 
                  : 'ml-2 mr-auto bg-gray-200 text-gray-800'
              } p-3 rounded-lg max-w-[80%]`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {message.text}
            </MotionDiv>
          ))}
          
          {isProcessing && (
            <MotionDiv 
              className="ml-2 mr-auto bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[80%] flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </MotionDiv>
          )}
        </div>
        
        <div className="p-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && !isProcessing && handleTherapyInput(userInput)}
              placeholder="Type how you're feeling..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <MotionButton
              onClick={() => userInput.trim() && !isProcessing && handleTherapyInput(userInput)}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: isProcessing ? 1 : 1.05 }}
              whileTap={{ scale: isProcessing ? 1 : 0.95 }}
              disabled={isProcessing}
            >
              Send
            </MotionButton>
            {speechSupported && (
              <MotionButton
                onClick={() => {
                  if (!isProcessing) {
                    SpeechRecognition.startListening({ continuous: false });
                    setTimeout(handleVoiceTherapyInput, 3000);
                  }
                }}
                className={`bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                whileTap={{ scale: isProcessing ? 1 : 0.95 }}
                disabled={isProcessing}
              >
                🎤
              </MotionButton>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Talk about how you're feeling or ask for help with anxiety, depression, or stress
            </p>
            <label className="flex items-center space-x-2 text-xs">
              <input 
                type="checkbox" 
                checked={speakResponses} 
                onChange={() => setSpeakResponses(!speakResponses)} 
                className="form-checkbox h-3 w-3"
              />
              <span>Speak responses</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Therapy;
