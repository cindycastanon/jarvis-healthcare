import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Fix linter error by using motion components explicitly
const MotionDiv = motion.div;
const MotionButton = motion.button;

// Therapy responses based on input
const therapyResponses = {
  depression: [
    "It's important to recognize that depression is a medical condition, not a sign of weakness.",
    "Have you considered speaking with a mental health professional about how you're feeling?",
    "Small daily activities like light exercise or connecting with a friend can help improve your mood.",
    "Remember that recovery is not linear, and it's okay to have good days and bad days."
  ],
  anxiety: [
    "Let's practice a breathing exercise together. Breathe in for 4 counts, hold for 7, and exhale for 8 counts.",
    "Try to identify specific triggers for your anxiety and consider how to address them one at a time.",
    "Grounding techniques can help during moments of anxiety. Can you name 5 things you see right now?",
    "Have you tried mindfulness meditation? Even a few minutes daily can help reduce anxiety symptoms."
  ],
  stress: [
    "It's important to set boundaries and prioritize self-care when managing stress.",
    "Consider breaking down large tasks into smaller, manageable steps.",
    "Regular physical activity, even just a short walk, can significantly reduce stress levels.",
    "Adequate sleep plays a crucial role in stress management. Are you getting enough rest?"
  ]
};

const Therapy = () => {
  const [therapyDialog, setTherapyDialog] = useState([
    { speaker: 'assistant', text: 'Hello! I\'m your virtual therapist. How are you feeling today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [speakResponses, setSpeakResponses] = useState(false); // Default to not speaking
  
  const { transcript, resetTranscript } = useSpeechRecognition();
  const speechSupported = SpeechRecognition.browserSupportsSpeechRecognition();
  
  // Basic therapy response system
  const handleTherapyInput = (text) => {
    // Add user message to dialog
    setTherapyDialog([
      ...therapyDialog, 
      { speaker: 'user', text }
    ]);
    
    // Reset input field
    setUserInput('');
    
    // Analyze input and respond
    setTimeout(() => {
      let response = "I understand. Could you tell me more about how you're feeling?";
      
      const lowerText = text.toLowerCase();
      
      // Check for specific conditions
      if (lowerText.includes('depress') || lowerText.includes('sad') || lowerText.includes('hopeless')) {
        const randomResponse = therapyResponses.depression[Math.floor(Math.random() * therapyResponses.depression.length)];
        response = randomResponse;
      } 
      else if (lowerText.includes('anxious') || lowerText.includes('anxiety') || lowerText.includes('worry') || lowerText.includes('panic')) {
        const randomResponse = therapyResponses.anxiety[Math.floor(Math.random() * therapyResponses.anxiety.length)];
        response = randomResponse;
      }
      else if (lowerText.includes('stress') || lowerText.includes('overwhelm') || lowerText.includes('too much')) {
        const randomResponse = therapyResponses.stress[Math.floor(Math.random() * therapyResponses.stress.length)];
        response = randomResponse;
      }
      
      // Add assistant response
      setTherapyDialog(current => [
        ...current, 
        { speaker: 'assistant', text: response }
      ]);
      
    }, 1000); // Delay to simulate thinking
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
      <h2 className="text-xl font-semibold text-gray-800">Voice Therapy Assistant</h2>
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
        </div>
        
        <div className="p-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleTherapyInput(userInput)}
              placeholder="Type how you're feeling..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MotionButton
              onClick={() => userInput.trim() && handleTherapyInput(userInput)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send
            </MotionButton>
            {speechSupported && (
              <MotionButton
                onClick={() => {
                  SpeechRecognition.startListening({ continuous: false });
                  setTimeout(handleVoiceTherapyInput, 3000);
                }}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎤
              </MotionButton>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Try saying how you feel or ask about depression, anxiety, or stress
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
