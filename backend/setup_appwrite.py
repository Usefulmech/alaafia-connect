import os
import time
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases

load_dotenv()

# We need to initialize the Appwrite Client
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)

DB_ID = os.getenv('APPWRITE_DATABASE_ID')

def create_collection(collection_id, name):
    try:
        print(f"Creating collection: {name}")
        databases.create_collection(
            database_id=DB_ID,
            collection_id=collection_id,
            name=name
        )
        print(f"? Created collection {name}")
    except Exception as e:
        if "already exists" in str(e).lower():
            print(f"- Collection {name} already exists.")
        else:
            print(f"? Error creating {name}: {e}")

def create_string_attr(collection_id, key, size, required=False):
    try:
        databases.create_string_attribute(
            database_id=DB_ID,
            collection_id=collection_id,
            key=key,
            size=size,
            required=required
        )
        print(f"  + Added string attribute: {key}")
        time.sleep(1.5) # Appwrite takes time to provision attributes
    except Exception as e:
        if "already exists" in str(e).lower():
            pass
        else:
            print(f"  ? Error adding {key}: {e}")

def create_boolean_attr(collection_id, key, required=False, default=False):
    try:
        databases.create_boolean_attribute(
            database_id=DB_ID,
            collection_id=collection_id,
            key=key,
            required=required,
            default=default
        )
        print(f"  + Added boolean attribute: {key}")
        time.sleep(1.5)
    except Exception as e:
        if "already exists" in str(e).lower():
            pass
        else:
            print(f"  ? Error adding {key}: {e}")

print("--- Initializing Appwrite Schema ---")

# 1. Profiles
create_collection('profiles', 'Profiles')
create_string_attr('profiles', 'user_id', 128, True)
create_string_attr('profiles', 'phone', 32, False)
create_string_attr('profiles', 'role', 32, True) # 'patient' or 'doctor'
create_string_attr('profiles', 'full_name', 128, False)
create_string_attr('profiles', 'mdcn_number', 64, False)

# 2. Consultations
create_collection('consultations', 'Consultations')
create_string_attr('consultations', 'patient_id', 128, True)
create_string_attr('consultations', 'doctor_id', 128, False)
create_string_attr('consultations', 'status', 32, True) # 'paid', 'active', 'completed'
create_string_attr('consultations', 'triage_summary', 1000, False)
create_string_attr('consultations', 'created_at', 128, True)

# 3. Messages
create_collection('messages', 'Messages')
create_string_attr('messages', 'consultation_id', 128, True)
create_string_attr('messages', 'sender_id', 128, True)
create_string_attr('messages', 'role', 32, True) # 'patient', 'doctor', 'system'
create_string_attr('messages', 'content', 5000, True)
create_string_attr('messages', 'created_at', 128, True)

# 4. Medications
create_collection('medications', 'Medications')
create_string_attr('medications', 'patient_id', 128, True)
create_string_attr('medications', 'consultation_id', 128, False)
create_string_attr('medications', 'drug_name', 256, True)
create_string_attr('medications', 'dosage', 256, False)
create_boolean_attr('medications', 'verified', False, True)
create_string_attr('medications', 'created_at', 128, True)

print("--- Schema Initialization Complete ---")
