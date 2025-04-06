import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import DashboardVoice from './DashboardVoice';
import Medication from './Medication';
import Therapy from './Therapy';
import Overview from './Overview';
import Vitals from './Vitals';

// Fix linter error by using motion components explicitly
const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionH1 = motion.h1;

const dashboardSections = [
  { id: 'overview', title: 'Health Overview', icon: '❤️' },
  { id: 'vitals', title: 'Vital Metrics', icon: '📊' },
  { id: 'therapy', title: 'Voice Therapy', icon: '🗣️' },
  { id: 'medication', title: 'Medication', icon: '💊' }
];

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isListening, setIsListening] = useState(false);
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: 'Sertraline', dosage: '50mg', schedule: 'Once daily, morning', type: 'Antidepressant' },
    { id: 2, name: 'Lorazepam', dosage: '0.5mg', schedule: 'As needed', type: 'Anti-anxiety' },
    { id: 3, name: 'Melatonin', dosage: '3mg', schedule: 'Once daily, bedtime', type: 'Sleep aid' }
  ]);
  
  const { transcript, resetTranscript } = useSpeechRecognition();
  
  // Handler for section change from voice component
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };
  
  // Handle voice commands for navigation
  useEffect(() => {
    if (isListening && transcript) {
      const text = transcript.toLowerCase();
      
      // Simple navigation by section name
      dashboardSections.forEach(section => {
        if (text.includes(section.title.toLowerCase())) {
          setActiveSection(section.id);
          resetTranscript();
        }
      });
      
      // Additional commands by keywords
      if (text.includes('pill') || text.includes('medicine') || text.includes('prescription')) {
        setActiveSection('medication');
        resetTranscript();
      } else if (text.includes('talk') || text.includes('therapist') || text.includes('feeling')) {
        setActiveSection('therapy');
        resetTranscript();
      }
    }
  }, [transcript, isListening, resetTranscript]);
  
  // Toggle voice listening
  const handleToggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    }
  };
  
  return (
    <div className="min-h-screen h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex flex-col">
      <MotionDiv 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="p-4 sm:p-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <MotionH1 
              className="text-2xl sm:text-3xl font-bold text-gray-800"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Healthcare Dashboard
            </MotionH1>
            
            <div className="flex space-x-3">
              {/* Add DashboardVoice component */}
              <DashboardVoice onSectionChange={handleSectionChange} />
              
              <MotionButton
                onClick={handleToggleListening}
                className={`flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isListening ? '🎤 Stop' : '🎤 Start'} Voice Navigation
              </MotionButton>
            </div>
          </div>
          
          {isListening && (
            <MotionDiv 
              className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p>Listening... Say section names to navigate.</p>
              <p className="font-semibold mt-1">Heard: {transcript}</p>
            </MotionDiv>
          )}
          
          <div className="flex space-x-1 mb-4 overflow-x-auto pb-2">
            {dashboardSections.map((section) => (
              <MotionButton
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-2 rounded-md whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </MotionButton>
            ))}
          </div>
          
          <MotionDiv
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-xl p-4 sm:p-6 flex-1 overflow-y-auto"
          >
            {activeSection === 'overview' && <Overview />}
            {activeSection === 'vitals' && <Vitals />}
            {activeSection === 'therapy' && <Therapy />}
            {activeSection === 'medication' && <Medication prescriptions={prescriptions} setPrescriptions={setPrescriptions} />}
          </MotionDiv>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Dashboard;