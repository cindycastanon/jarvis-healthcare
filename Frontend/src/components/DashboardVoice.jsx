import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const DashboardVoice = ({ onSectionChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  
  // Initial greeting when component mounts - only speaks once
  useEffect(() => {
    if (!voiceInitialized) {
      setTimeout(() => {
        speak(`Welcome to your healthcare dashboard. I'm ready to help you navigate.`);
        setVoiceInitialized(true);
      }, 1000); // Delay by 1 second to ensure page is loaded
    }
  }, [voiceInitialized]);
  
  // Handle voice commands for navigation
  useEffect(() => {
    if (transcript && isListening) {
      const lowercaseTranscript = transcript.toLowerCase();
      
      // External website navigation commands
      if (lowercaseTranscript.includes("open youtube") || lowercaseTranscript.includes("go to youtube")) {
        window.open("https://www.youtube.com", "_blank");
        resetTranscript();
      }
      
      else if (lowercaseTranscript.includes("open google") || lowercaseTranscript.includes("go to google")) {
        window.open("https://www.google.com", "_blank");
        resetTranscript();
      }
      
      else if (lowercaseTranscript.includes("open wikipedia") || lowercaseTranscript.includes("go to wikipedia")) {
        window.open("https://www.wikipedia.org", "_blank");
        resetTranscript();
      }
      
      else if (lowercaseTranscript.includes("search for") || lowercaseTranscript.includes("look up")) {
        // Extract the search query
        let searchQuery = "";
        if (lowercaseTranscript.includes("search for")) {
          searchQuery = lowercaseTranscript.split("search for")[1].trim();
        } else if (lowercaseTranscript.includes("look up")) {
          searchQuery = lowercaseTranscript.split("look up")[1].trim();
        }
        
        if (searchQuery) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
        }
        resetTranscript();
      }
      
      // Pill detection specific commands (check these first as they're more specific)
      else if (lowercaseTranscript.includes("scan") && 
         (lowercaseTranscript.includes("pill") || lowercaseTranscript.includes("medication"))) {
        onSectionChange('medication');
        resetTranscript();
        // Could trigger camera functionality here
      }
      
      else if (lowercaseTranscript.includes("identify") && 
              (lowercaseTranscript.includes("pill") || lowercaseTranscript.includes("medication"))) {
        onSectionChange('medication');
        resetTranscript();
        // Could trigger pill identification functionality here
      }
      
      // Dashboard navigation commands
      else if (lowercaseTranscript.includes("medication") || 
          lowercaseTranscript.includes("pill") || 
          lowercaseTranscript.includes("medicine") || 
          lowercaseTranscript.includes("prescription")) {
        onSectionChange('medication');
        resetTranscript();
      }
      
      else if (lowercaseTranscript.includes("therapy") || 
               lowercaseTranscript.includes("mental health") || 
               lowercaseTranscript.includes("depression") || 
               lowercaseTranscript.includes("talk") || 
               lowercaseTranscript.includes("feeling sad")) {
        onSectionChange('therapy');
        resetTranscript();
      }
      
      else if (lowercaseTranscript.includes("overview") || 
               lowercaseTranscript.includes("summary") || 
               lowercaseTranscript.includes("health overview") || 
               lowercaseTranscript.includes("home")) {
        onSectionChange('overview');
        resetTranscript();
      }
      
      else if (lowercaseTranscript.includes("vitals") || 
               lowercaseTranscript.includes("metrics") || 
               lowercaseTranscript.includes("measurements") || 
               lowercaseTranscript.includes("stats") || 
               lowercaseTranscript.includes("numbers")) {
        onSectionChange('vitals');
        resetTranscript();
      }
      
      // Additional utility commands
      else if (lowercaseTranscript.includes("what time is it") || lowercaseTranscript.includes("current time")) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        speak(`The current time is ${timeString}`);
        resetTranscript();
      }
      
      else if (lowercaseTranscript.includes("what day is it") || lowercaseTranscript.includes("what is today")) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString(undefined, options);
        speak(`Today is ${dateString}`);
        resetTranscript();
      }
      
      // Stop listening command
      else if (lowercaseTranscript.includes("stop listening")) {
        handleToggleListening();
        resetTranscript();
      }
    }
  }, [transcript, resetTranscript, isListening, onSectionChange]);
  
  // Web Speech API for text-to-speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Optionally set voice, rate, pitch, etc.
      utterance.rate = 1.0; // Speed: 0.1 to 10
      utterance.pitch = 1.0; // Pitch: 0 to 2
      utterance.volume = 1.0; // Volume: 0 to 1
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const handleToggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      speak("Voice navigation paused");
    } else {
      SpeechRecognition.startListening({ continuous: true });
      speak("Voice navigation activated. How can I help you?");
    }
    setIsListening(!isListening);
  };
  
  if (!browserSupportsSpeechRecognition) {
    return <div className="text-sm text-red-500">Your browser doesn't support speech recognition.</div>;
  }
  
  return (
    <div className="voice-control mt-3">
      <button
        onClick={handleToggleListening}
        className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${
          isListening ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
        }`}
      >
        <span className={`relative flex h-3 w-3 ${isListening ? 'opacity-100' : 'opacity-0'}`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        {isListening ? 'Listening...' : 'Enable Voice Control'}
      </button>
      {isListening && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
          {transcript ? `"${transcript}"` : 'Say something...'}
        </div>
      )}
    </div>
  );
};

export default DashboardVoice; 