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
import pyaudio
import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.utils import load_img
import zipfile
import pandas as pd


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

################# defining cancer module ####################
def cancer_module_images():
    zip_path = r"C:\Users\DELL\Downloads\archive (1).zip"
    extract_path = r"C:\Users\DELL\Downloads\extracted_dataset"

    # Extract the zip file if it hasn't been extracted already
    if not os.path.exists(extract_path):
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

    # Set the dataset path to the extracted folder
    dataset_path = os.path.join(extract_path)
    print(f"Dataset extracted to: {dataset_path}")

    train_path = os.path.join(dataset_path, 'train')
    categories = ['benign', 'malignant']

    num_images = 4

    plt.figure(figsize=(10, 5))
    for i, category in enumerate(categories):
        category_dir = os.path.join(train_path, category)
        # Get a few image names from the category folder
        img_names = os.listdir(category_dir)[:num_images]
    
        for j, img_name in enumerate(img_names):
            img_path = os.path.join(category_dir, img_name)
            # Load the image (resizing to 224x224; adjust if needed)
            img = load_img(img_path, target_size=(224,224))
            plt.subplot(len(categories), num_images, i*num_images + j + 1)
            plt.imshow(img)
            plt.title(f"{category}")
            plt.axis('off')

    plt.tight_layout()
    plt.show()


def case_summary():
    zip_path = r"C:\Users\DELL\Downloads\archive (1).zip"
    extract_path = r"C:\Users\DELL\Downloads\extracted_dataset"

    # Extract the zip file if it hasn't been extracted already
    if not os.path.exists(extract_path):
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

    # Set the dataset path to the extracted folder
    dataset_path = os.path.join(extract_path)
    print(f"Dataset extracted to: {dataset_path}")

    train_path = os.path.join(dataset_path, 'train')
    categories = ['benign', 'malignant']

    csv_path = r"C:\Users\DELL\Downloads\clinical.csv"

    # Read the CSV file into a DataFrame
    df = pd.read_csv(csv_path)

    print("CSV file loaded successfully. Here are the first few rows:")

# Filter the DataFrame to include only rows where 'demographic_vital_status' is 'Alive'

    if 'demographic_vital_status' in df.columns:
        alive_data_set = df[df['demographic_vital_status'] == 'Alive']

    # Save the new dataset to a CSV file (optional)
        alive_data_set.to_csv(r"C:\Users\DELL\Downloads\alive_data_set.csv", index=False)
        print("New dataset with only 'Alive' patients saved successfully.")
    else:
        print("The column 'demographic_vital_status' is not present in the CSV file.")

    target_case_id = [
    'b85b14d7-3b5a-4800-af12-622ec03b9fe5',
    '1b3f92b7-658a-4bbd-b086-20c1cd976d54',
    'bda2f09a-82c4-40ec-90e8-0bf63916a5c7',
    'e36c9411-773b-4a8e-9b43-895b3cb044c7',
    'a3df4ba6-538e-4b53-a356-eb1ef743b2ab',
    '7ee2f8d5-6c31-4f5f-a779-b43979e66d0b',
    '3a8cfea5-1dcd-4dbb-bbd9-5bb602c54922',
    'd32a4219-4cca-470f-b6b3-11447d9f5e0b',
    '7ce09a09-074e-4f38-bed7-98ab34347fbe',
    '08d2b181-2b6e-4754-bfa9-5a94a1f18526',
    '021d32b0-a94a-4dad-95f4-8eb0abd894bf',
    '6250b800-f72e-4c8e-a0e0-206049398ba7',
    '2f1bbe96-49d9-417b-bc9c-a09992489340',
    '555bbd13-8ad7-43b3-9087-001db30089f1',
    '68f75ab5-9d77-40c5-a8ce-f56016bbe9e4',
    '69c0ef46-3117-46f3-b36e-581eb03eb829',
    'a67fd5bb-b6b6-4e00-9acd-68d0a59b5e55',
    '97991c80-c4aa-4ede-9fd9-bbaff9c4a472',
    '6a1966c3-7f01-4304-b4a1-c4ef683b179a',
    'e699a2a7-dbff-4122-8114-87d70a56f59f',
    'bc71a91d-8ad1-4bab-a4fa-89470aa4e4d0',
    '854466bf-b943-4acb-b4f1-6b285cb813e3',
    '05f4058d-3066-4d16-8320-cf92f122945f',
    '7b92fcd4-f9be-4b97-94a2-b2e8348aeaba',
    '267b98e7-708f-458a-82d1-5faa415b9ee7',
    '32e40e0b-e74b-428c-acd3-84ec6a80c024',
    '92116b0b-e614-4a27-a3c2-207e561c788b',
    'a5ab4498-8721-40ea-8ee4-fc1a6d05721d',
    '2e6f9985-6d13-4b08-8a40-5ea44e9553f0',
    '3fea3f02-2db3-44e0-984e-c61130d92c9b',
    '5bf40b29-d722-430a-91bc-cad941ee3694',
    '29bcb876-5a91-4d56-af47-7b4c856c151f',
    '53de8f81-a226-4ab9-bddc-856ffd111817',
    '1404791b-86bf-4dfd-85b4-c8ff356f109c',
    '01cb0004-fc1e-4da5-9d27-f458f8d711ee',
    '0b1f4f52-12ec-44ab-8283-a502bdf48c3a',
    '0bb8c284-412b-4bbc-a508-d0a21db376cd',
    '1251acee-ceb4-4530-ba5b-4d163fcab8d2',
    '187376e0-b4f3-44ed-ab43-88b6eff3e552',
    '197ac33e-d5df-40de-92f2-6ef7fe2ad6dd',
    '1c052cde-7a70-410b-a273-dbe39dd968f4',
    '1ca2eb9f-9496-450f-83fe-c7a6cb1a075b',
    '1cad4b22-ec8b-4e34-bfef-5464d185923a',
    '236ef9ca-9362-44f3-a36b-2a19509bab9d',
    '27c9e7aa-1760-4cfc-95b0-a091d35d317b',
    '285d8e2c-f183-49d5-bc1c-fd47c6670acc',
    '2c79add1-8093-4e81-8f80-069af7b7c2fa',
    '2c8d436c-4edb-4083-b23f-9a33307d5bb2',
    '2e0f7da5-9078-4c7f-b074-565246529a83',
    '3429967f-4f77-4894-bf27-c4a22698ca92',
    '391eab51-b140-4bc2-bc8c-99400fba9066',
    '3dd5a206-d7f3-42f1-b9cc-4b31c76d495d',
    '3e39c93e-ccae-48d5-9b27-62dae0e75c07',
    '455f982c-a067-46ac-bf89-3e535d0ffca0',
    '49f961af-1126-431d-93cd-18941c1738f3',
    '4a2135bd-31ff-4564-9e87-1164b3422f61',
    '4e9d1a69-1f10-4500-9dda-f8eb1ccc6576',
    '50dc9c63-c491-4afc-ab12-74b40eba58b6',
    '51f3321b-ed78-4bdd-aa75-7d632ef53df1',
    '5226b25f-e326-4884-af79-916e4bbb701f',
    '536e1779-550b-47f1-a204-50a16870a8e1',
    '554270fb-1fb3-4aeb-81a1-f78c30b143b4',
    '5564e6a7-2195-4b0d-994e-b0617b58e889',
    '590b5e18-d837-4c0e-becf-80520db57c0f',
    '5bc515c8-7727-4d69-98e9-31bbcb748550',
    '5f39db5b-e5c6-4b7c-acbc-a7c73b556829',
    '5f8cc8d6-8a1c-41d0-bad6-fedd2948f40a',
    '62393dab-ab41-4785-9a57-aa4c25d223e9',
    '633ddc04-c424-42c8-8e54-673968b130a7',
    '63db0da6-f451-436f-9b1c-211b55947770',
    '64690c6f-80cf-4a87-932c-7d7b3d0fbf6f',
    '667d5c5e-abc0-4fb8-b6c4-739f7cb3f0fe',
    '6783fb7d-f509-47c6-b39f-535a9026f6bc',
    '68567581-0be3-48f1-8dcd-487bc0c1e6f6',
    '6993bc23-cd58-4761-bb77-3a3dcc2f7a1b',
    '6b02def4-04ca-4ba0-bc48-262c4d8a294c',
    '6e2d8818-b377-45f5-97f4-f905de22c487',
    '6fe664cc-e66b-4abf-a7d2-08bb4ce8eba3',
    '727a7579-bd82-4141-973f-794424f4d111',
    '7436a28f-01a3-4148-b38e-63c57b5d86c4',
    '76cc1d42-acec-46b3-9663-5e4de2550353',
    '78f3d4db-a1ff-4ea2-aaa0-cbf0278b915e',
    '7a918706-c697-4cef-9661-346c5a612ff8',
    '7c6e2fe9-d1ff-4bf4-bda1-cc3615eb3584',
    '7fb87427-9b19-4378-86d5-f4f775f97805',
    '800f3039-97e0-441e-8292-4ccf1bb4797a',
    '82e85ac9-8e3e-4c2e-ae0b-a32ceeb8115d',
    '8352cbb0-10e7-40bd-96f0-1e982ab4c07b',
    '888ef0fc-fc84-4afb-a369-695fee5ae4f6',
    '889ae822-add8-4a10-abe0-50176c858f80',
    '8b6b1cbf-dedb-4c99-8f75-eafbe5c43592',
    '8ee500d6-c7b3-46e9-86d0-933695934707',
    '90402c32-9548-432e-85b8-a4f80e14401e',
    '905ea29f-588a-497b-9f06-2eef3bdc9442',
    '90aa7540-93e7-4ffa-9e77-879198be1e7b',
    '960899ed-b61b-4b20-b16d-e37dffb01aa3',
    '96fc529a-6ad3-456f-a41a-63238ecbb9c4',
    '99706ad3-5cf4-45f8-815e-51e78f2e9f79',
    '9c47ab1d-e3bd-4191-bd60-4a2123de534e',
    '9d86940d-50fb-4d2f-8b1e-539196885f46',
    '9e5a0b7e-9682-4f29-8e4a-7af968ca93fc',
    '9ef30567-6e19-4cd0-8ec8-69194136418d',
    'a01a350d-64be-4af3-91c3-7d681c3db11d',
    'a5930bc2-d0e4-454f-b60d-5dd1148d4669',
    'a9255dcb-b236-4777-ac43-555e3a5386c3',
    'a9eb1022-ffd3-42de-a39d-2126fc7ec0ce',
    'af852862-f01e-4ddd-82c6-9781c93ef20b',
    'b1739cb5-09bc-414a-8f05-c66d2cb9868d',
    'b2fbea07-eede-4ab1-994a-da26583a5106',
    'b44cced8-88db-4769-a1b0-b09d28558277',
    'b53cf25c-929c-4f1a-870e-13f260c5cf7d',
    'b5abfbd1-8f92-4ba3-8f2b-801fb600397a',
    'b6ee9305-c935-4692-81f3-956956d5b4c4',
    'c4ed9e22-b5d7-4469-89a8-861a86791c8b',
    'c757c326-6803-4451-a2d3-4368812855a7',
    'c787c4da-c564-44f1-89eb-dd9da107acb1',
    'caaf50a4-13b5-4003-b52f-e5f9780f9f94',
    'd0c3a83d-a1bf-4e9a-a610-2fb4370f2891',
    'd56a707b-dbf5-481d-9d93-1e23a854a684',
    'd6283ab0-9019-4ad2-93aa-2e6b39cd9641',
    'd7e86c99-a716-48b8-b067-e73d68b14dee',
    'd7ee2693-39a8-4e3a-b6f6-e4729800e34e',
    'd84d9c7b-b464-4ea1-8c39-9c929bb34c08',
    'dcc005ba-f8c9-4845-bf08-0dbabe291c9a',
    'debd7156-8b97-4bdf-9dd9-7e469277d252',
    'dfe8baa8-1c2c-4c36-92c9-61548cebec19',
    'dfe9d2bd-2317-4103-b493-41c5469e08a0',
    'e2271488-1a7d-4733-a1ea-38bbaeb97b4c',
    'e865b9be-ca10-4805-9634-2f35ad18b63e',
    'e9f0f030-d9aa-47c8-9f4d-a9ce58888c41',
    'ea6337b3-3b5e-489e-ae2f-2908447f6300',
    'ee08eda6-033e-403b-a26a-747b118ae897',
    'ee143e06-0334-45dd-a2b0-1169527d6b4e',
    'eea5ea8b-6579-44c2-a205-47befe82ee9f',
    'ef40fa3d-807b-47c1-9f77-58e9778ce391',
    'ef7bc188-6aec-467e-801a-ab2109a28104',
    'eff78af6-0f68-49b9-866b-0d511606f2b1',
    'f0744fa2-db4a-40de-9fd2-f61863fd98d4',
    'f1a69042-8347-45c1-b925-8526a8443b86',
    'f405c603-bcbc-434f-b620-c32eb27b215b',
    'f632effd-be12-41ab-8e4f-2a5f38af8bae',
    'f9d113e3-9127-491c-9227-33770bf2b23f',
    'f9e36bc2-484f-48e8-82ba-99026957277a',
    'fa099993-ef30-4eff-a8fb-aa41b5ea671a',
    'fc5b5d2f-0d03-45c2-b7a0-ba6ec108fe51',
    'fda160c9-efdc-4263-98f1-e38b00571b4d',
    'fdbbdbf8-cf2e-4550-9727-b023aed9b8d9',
    'b6b51b28-bdee-4fe6-a3f3-7b128e16721c'
]

# List of CSV file paths (ensure this is a list, even if there's only one file)
    csv_files = [r"C:\Users\DELL\Downloads\pathology_detail.csv", 
             r"C:\Users\DELL\Downloads\alive_data_set.csv",
             r"C:\Users\DELL\Downloads\sample.csv"]

# Initialize an empty DataFrame to store the collected information
    collected_data = pd.DataFrame()

# Iterate through each CSV file
    for file_path in csv_files:
    # Read the CSV file into a DataFrame
        try:
            df = pd.read_csv(file_path)
        
        # Check if the 'cases.case_id' column exists in the current file
            if 'cases_case_id' in df.columns:
            # Filter rows matching the target case_id
                for i in range(len(target_case_id)):
                    filtered_data = df[df['cases_case_id'] == target_case_id[i]]
                # Append the filtered data to the collected_data DataFrame
                    collected_data = pd.concat([collected_data, filtered_data], ignore_index=True)
            else:
                print(f"'cases_case_id' column not found in {file_path}")
        except FileNotFoundError:
            print(f"File not found: {file_path}")
        except Exception as e:
            print(f"An error occurred while processing {file_path}: {e}")

# Save the collected data to a new CSV file (optional)
    if not collected_data.empty:
        collected_data.to_csv(r"C:\Users\DELL\Downloads\collected_case_data.csv", index=False)
        print("Collected data saved to 'collected_case_data.csv'")
    else:
        print(f"No data found for case_id: {target_case_id}")

# Print the collected data
    print("Collected data for case_id:", target_case_id)
    print(collected_data)


################# defining cancer module ####################
def cancer_module():
    zip_path = r"C:\Users\DELL\Downloads\archive (1).zip"
    extract_path = r"C:\Users\DELL\Downloads\extracted_dataset"

    # Extract the zip file if it hasn't been extracted already
    if not os.path.exists(extract_path):
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

    # Set the dataset path to the extracted folder
    dataset_path = os.path.join(extract_path)
    print(f"Dataset extracted to: {dataset_path}")

    train_path = os.path.join(dataset_path, 'train')
    categories = ['benign', 'malignant']


    open_dashboard("cancer module")
    speak("Welcome to the Cancer Module. How can I assist you today?")
    # Add functionality for cancer-related queries here
    while True:
        speak("You can ask me about types of cancer, symptoms, treatments, or prevention tips. Say 'exit' to leave the cancer module.")
        query = takecommands().lower()

        if "types of cancer" in query:
            speak("There are many types of cancer, including breast cancer, lung cancer, prostate cancer, skin cancer, and leukemia. Which one would you like to know more about?")
        
        elif "view images" in query or "show images" in query:
            speak("Here are some images related to cancer types.")
            cancer_module_images()

        elif "case summary" in query or "case" in query:
            speak("Please provide the details of the case you would like to summarize.")
            case_details = input("Please provide the case details: ")
            # Process the case details and provide a summary
            # Here, you can add functionality to process the case details and provide a summary.
            # For now, we'll just acknowledge the input.
            speak(f"Thank you for providing the case details: {case_details}. I will summarize it for you.")
            case_summary()

        elif "symptoms" in query:
            speak("Cancer symptoms vary depending on the type, but common signs include unexplained weight loss, persistent fatigue, lumps or swelling, and changes in skin or moles. Please consult a doctor for a proper diagnosis.")
        
        elif "treatment" in query:
            speak("Cancer treatments include surgery, chemotherapy, radiation therapy, immunotherapy, and targeted therapy. The best treatment depends on the type and stage of cancer.")
        
        elif "prevention" in query:
            speak("To reduce your risk of cancer, avoid smoking, maintain a healthy diet, exercise regularly, limit alcohol consumption, and protect your skin from the sun.")
        
        elif "exit" in query or "quit" in query:
            speak("Exiting the cancer module. Let me know if you need further assistance.")
            open_dashboard("overview")
            break
        
        else:
            speak("I'm not sure how to help with that. Could you please rephrase or ask something else?")

    # For example, you could add commands to provide information about types of cancer, treatment options, etc.
    # This is a placeholder for future development.

    pass


# Main loop
while True:
    query = takecommands()
    if query and query.lower() != "none":
        query = query.lower()
        
        # Dashboard navigation commands
        if "dashboard" in query or "healthcare" in query:
            open_dashboard()

        elif "cancer_module" in query or "cancer" in query:
            cancer_module()
            print("Opening the cancer module. Please wait./n You can ask me about types of cancer, symptoms, treatments, or prevention tips./n Or you can ask for case summary and I will provide you with the target case ID summary.")
            speak("Opening the cancer module. Please wait./n You can ask me about types of cancer, symptoms, treatments, or prevention tips./n Or you can ask for case summary and I will provide you with the target case ID summary.")
            
        elif "medication" in query or "pill" in query or "medicine" in query or "prescription" in query:
            open_dashboard("medication")
            
        elif "therapy" in query or "mental health" in query or "depression" in query or "talk" in query or "feeling sad" in query:
            open_dashboard("therapy")
            
        elif "overview" in query or "summary" in query or "health overview" in query or "home" in query:
            open_dashboard("overview")
            
        elif "vitals" in query or "metrics" in query or "measurements" in query or "stats" in query or "numbers" in query:
            open_dashboard("vitals")
        
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