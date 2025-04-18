# Healthcare Dashboard with Voice Navigation
# Link: https://github.com/abdukarim17/healthcare
An interactive healthcare dashboard with AI-powered voice navigation for managing medications, therapy sessions, and health metrics.

## Features

- **Interactive Dashboard**: Modern UI with animations and health metrics visualization
- **Voice Navigation**: Control the dashboard using natural language voice commands  
- **Medication Tracker**: AI-powered pill detection and medication management
- **Voice Therapy**: Mental health assistance with conversational therapy
- **Vital Metrics**: Track and visualize health metrics

## Setup and Installation

### Dashboard (React App)

1. Install dependencies:
   ```
   cd Frontend
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

### Voice Assistant (Python)

1. Install required Python packages:
   ```
   pip install pyttsx3 SpeechRecognition wikipedia pywhatkit
   ```

2. Run the voice assistant:
   ```
   python voice_assistant.py
   ```

## Using Voice Navigation

The voice assistant integrates with the healthcare dashboard, allowing you to navigate and control it using voice commands:

### Voice Commands

- **Open Dashboard**: "Open healthcare dashboard" or "Show my dashboard"
- **Medication Tracking**: "Open medication tracker" or "Show my pills"
- **Therapy Section**: "I need therapy" or "Open therapy" or "I'm feeling depressed"
- **Health Overview**: "Show health overview" or "Open overview"
- **Vital Metrics**: "Show my vitals" or "Open metrics"

### Additional Commands

- **Health Tips**: "Tell me a health tip" or "Give me a health fact"
- **Medication Reminders**: "Remind me about my medication"
- **Side Effects**: "What about side effects?"
- **Help**: "Help" or "What can you do?"

## How It Works

1. The Python voice assistant listens for your commands
2. When it recognizes a healthcare-related command, it opens the dashboard
3. It passes parameters to the dashboard URL to navigate to specific sections
4. The React app detects these parameters and automatically navigates to the requested section

## Technologies Used

- **React**: Frontend dashboard with interactive components
- **Framer Motion**: Animations and transitions
- **Tailwind CSS**: Styling and layout
- **Google Gemini API**: AI-powered pill recognition
- **Speech Recognition**: Voice command detection
- **TTS (Text-to-Speech)**: Voice responses

## Notes

- Make sure the React app is running on port 5173 (default Vite port)
- If running on a different port, update the `DASHBOARD_URL` in the `voice_assistant.py` file
- For pill detection, you'll need to set up your own Gemini API key 
