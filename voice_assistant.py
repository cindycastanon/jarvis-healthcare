import pyttsx3  #python text to speech and three is for version 3
import speech_recognition as sr  #speech recognition
import datetime #date and time
import os  #operating system
import webbrowser  #web browser
import wikipedia  #wikipedia
import subprocess as sp  #subprocess
import pywhatkit as kit  #pywhatkit
import platform  #for detecting os
import time  #for sleep

#add print commands

# Check OS for proper initialization
if platform.system() == 'Windows':
    engine = pyttsx3.init('sapi5')  #initializing the engine #sapi5 is a microsoft speech api 
else:
    engine = pyttsx3.init()  # Use default driver for macOS/Linux

# Get available voices
voices = engine.getProperty('voices')  
if voices:  # Make sure voices are available
    engine.setProperty('voice', voices[0].id)  #setting the property of voices
    
# Set a slower rate for better clarity
# engine.setProperty('rate', 150)  # Default is 200

# React app URL - adjust as needed
DASHBOARD_URL = "http://localhost:5173"

def speak(audio):  #defining a function speak which will take text as an input and gives output as audio
    print(f"AI: {audio}")  # Print what the AI is saying
    try:
        engine.say(audio)  #engine will say the audio
        engine.runAndWait()  #engine will run and wait for the next command
    except Exception as e:
        print(f"Error with speech engine: {e}")

speak("Hello! I am Jarvis, your healthcare assistant. How can I help you today?")
print("You can ask me to navigate to different sections of your healthcare dashboard.")
print("Try saying: 'open medication tracker', 'I need therapy', or 'show my health overview'")
print("To stop the program at anytime, say 'stop' or 'exit'.")

def takecommands():
    r = sr.Recognizer()  #recognizer class
    try:
        with sr.Microphone() as source:  #using microphone as a source
            print("Listening...")
            r.pause_threshold = 2  #pause threshold
            r.adjust_for_ambient_noise(source, duration=1)  #adjusting the noise
            audio = r.listen(source)  #listening the audio
        
        print("Recognizing...")  #recognizing the audio
        query = r.recognize_google(audio, language='en-in')  #recognizing the audio in english
        print(f"You just said: {query}\n")  #printing the query
        return query
    except sr.UnknownValueError:
        speak("I didn't catch that. Could you please repeat?")
        return "None"
    except sr.RequestError:
        speak("I'm having trouble with my speech recognition service.")
        return "None"
    except Exception as e:
        print(f"Error: {e}")
        speak("Something went wrong with the microphone. Please try again.")
        return "None"

def open_dashboard(section=None):
    """Opens the healthcare dashboard, optionally to a specific section"""
    try:
        url = DASHBOARD_URL
        if section:
            # Add the section parameter to navigate directly to that section
            url += f"?section={section}"
        
        # Open the URL
        webbrowser.open(url)
        
        if section:
            speak(f"Opening the {section} section in your healthcare dashboard.")
        else:
            speak("Opening your healthcare dashboard.")
        
        # Wait for the browser to load
        time.sleep(1)
        
        return True
    except Exception as e:
        print(f"Error opening dashboard: {e}")
        speak("I couldn't open the healthcare dashboard. Please make sure it's running.")
        return False

def tell_joke():
    jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "What do you call a fake noodle? An impasta!"
    ]
    import random
    joke = random.choice(jokes)
    speak(joke)

def tell_fact():
    facts = [
        "Regular exercise can help reduce symptoms of depression and anxiety.",
        "Taking your medication at the same time each day helps maintain consistent levels in your bloodstream.",
        "Deep breathing exercises can help reduce stress and lower blood pressure.",
        "Mindfulness meditation can improve focus and reduce symptoms of anxiety and depression.",
        "Social connections are just as important for your health as diet and exercise."
    ]
    import random
    fact = random.choice(facts)
    speak(fact)

def tell_medication_reminder():
    """Provides a reminder about medication usage"""
    reminders = [
        "Remember to take your medications with food unless directed otherwise by your doctor.",
        "It's important to finish all prescribed antibiotics, even if you start feeling better.",
        "If you experience side effects from your medication, consult your healthcare provider before stopping.",
        "Setting an alarm on your phone can help you remember to take your medications at the same time each day.",
        "Keep a medication log to track when you've taken your doses and any side effects you experience."
    ]
    import random
    reminder = random.choice(reminders)
    speak(reminder)

print("Healthcare Voice Assistant is active. Speak your commands...")

# Main loop
while True:
    query = takecommands()
    if query and query.lower() != "none":
        query = query.lower()
        
        # Dashboard navigation commands
        if "dashboard" in query or "healthcare" in query:
            open_dashboard()
            
        elif "medication" in query or "pill" in query or "medicine" in query or "prescription" in query:
            open_dashboard("medication")
            
        elif "therapy" in query or "mental health" in query or "depression" in query or "talk" in query or "feeling sad" in query:
            open_dashboard("therapy")
            
        elif "overview" in query or "summary" in query or "health overview" in query or "home" in query:
            open_dashboard("overview")
            
        elif "vitals" in query or "metrics" in query or "measurements" in query or "stats" in query or "numbers" in query:
            open_dashbofard("vitals")
        
        # Pill detection specific commands
        elif "scan" in query and ("pill" in query or "medication" in query):
            open_dashboard("medication")
            speak("Opening medication scanner. Please place the pill in view of your camera.")
        
        elif "identify" in query and ("pill" in query or "medication" in query):
            open_dashboard("medication")
            speak("Opening medication identification tool. I'll help you identify your pills.")
        
        # Health information
        elif "remind" in query and "medication" in query:
            tell_medication_reminder()
        
        elif "side effect" in query:
            speak("If you're experiencing side effects from your medication, please consult with your healthcare provider.")
        
        # General assistant commands
        elif "what is your name" in query:
            speak("I am Jarvis, your healthcare assistant.")

        elif "who created you" in query:
            speak("I was created to help you manage your healthcare information.")

        elif "what time is it" in query or "time" in query:
            time = datetime.datetime.now().strftime("%H:%M")
            speak(f"The time is {time}.")
            
        elif "joke" in query:
            tell_joke()
            
        elif "fact" in query or "health tip" in query or "tip" in query:
            tell_fact()
        
        elif "thank you" in query or "thanks" in query:
            speak("You're welcome! Your health is my priority.")
        
        elif "help" in query:
            speak("You can ask me to navigate to different sections of your healthcare dashboard, like medication, therapy, vitals, or overview. I can also scan pills, provide health tips and medication reminders.")
            
        elif "stop" in query or "exit" in query or "goodbye" in query or "bye" in query or "quit" in query:
            speak("Goodbye! Remember to take care of your health and wellbeing.")
            break
        
        else:
            speak("I'm not sure how to help with that. Would you like me to open your healthcare dashboard?")
            response = takecommands()
            if response and ("yes" in response.lower() or "sure" in response.lower() or "okay" in response.lower()):
                open_dashboard()
                
    # Small delay to prevent CPU overuse
    time.sleep(0.1) 