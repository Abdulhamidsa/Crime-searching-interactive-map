from bottle import get, template, static_file, response
import x
from icecream import ic
import requests
import json  
from dotenv import load_dotenv
import os

##############################
@get("/")
def _():
  ic("xxxxxxx")
  return "BACKEND RUNNING READY FOR REQUESTS "
 
load_dotenv('.env')
username = os.getenv('username')
token = os.getenv('token')

@get("/get-crimes")
def _():
    query = {
        "query": """
            FOR crime IN crimes
            RETURN crime
        """
    }
    res = x.db(query)
    if res["error"] == False:
        response.headers["Access-Control-Allow-Origin"] = "*" 
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"  
        response.headers["Access-Control-Allow-Headers"] = "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"  
        response.content_type = "application/json"
        return json.dumps(res["result"])
    else:
        print("Error fetching crimes. Error message:", res["errorMessage"])
        return "Error fetching crimes"
##############################

def check_token(username, token):
    response = requests.get(
        f'https://www.pythonanywhere.com/api/v0/user/{username}/cpu/',
        headers={'Authorization': f'Token {token}'}
    )
    return response.status_code


@get('/insert-crimes')
def get_crimes():
    # Function to check if a collection exists and create it if it doesn't
    def ensure_collection_exists(collection_name, collection_type="document"):
        collection_query = {
            "query": f"""
                LET collectionExists = (FOR c IN COLLECTIONS() FILTER c.name == '{collection_name}' RETURN c)
                RETURN LENGTH(collectionExists) > 0
            """
        }
        result = x.db(collection_query)
        exists = result['result'][0]

        if not exists:
            if collection_type == "document":
                create_query = {
                    "query": f"CREATE COLLECTION {collection_name}"
                }
            elif collection_type == "edge":
                create_query = {
                    "query": f"CREATE EDGE COLLECTION {collection_name}"
                }
            x.db(create_query)

    # Ensure the required collections exist
    ensure_collection_exists("crimes")
    ensure_collection_exists("criminals")
    ensure_collection_exists("associates")
    ensure_collection_exists("relationships", "edge")

    # Check token validity
    if check_token(username, token) == 200:
        crimes_response = requests.get('https://abdulhamidsa.pythonanywhere.com/crimes')
        if crimes_response.status_code == 200:
            # Extract JSON data from the response
            crimes_data = crimes_response.json()
            criminals_data = []
            associates_data = []
            edges_data = []

            if crimes_data:
                for crime in crimes_data:
                    # Check for a criminal and add to criminals_data if exists
                    if crime['criminal']:
                        crime['criminal']['type'] = 'criminal'
                        crime['criminal']['crime_type'] = crime['crime_type']  # Add the crime type to the criminal
                        criminals_data.append(crime['criminal'])
                    # Check for suspects and add to criminals_data if exist
                    if crime.get('associates'):
                        for associate in crime['associates']:
                            associates_data.append(associate)
                    # Insert the crime into the crimes collection
                    query = {
                        "query": """
                            INSERT @crime INTO crimes RETURN NEW
                        """,
                        "bindVars": {
                            "crime": crime
                        }
                    }
                    res = x.db(query)
                # Insert the extracted criminals into the criminals collection
                for criminal in criminals_data:
                    query = {
                        "query": """
                            INSERT @criminal INTO criminals RETURN NEW
                        """,
                        "bindVars": {
                            "criminal": criminal
                        }
                    }
                    res = x.db(query)
                    
                for associate in associates_data:
                    query = {
                        "query": """
                            INSERT @associate INTO associates RETURN NEW
                        """,
                        "bindVars": {
                            "associate": associate
                        }
                    }
                    res = x.db(query)
            return "Crimes, criminals, associates, and relationships data fetched and saved to the database"
        else:
            response.status = crimes_response.status_code
            return json.dumps({"error": "Failed to fetch crime data."})
    else:
        return json.dumps({"error": "Token is invalid."})








##############################
# @get("/get-crimes")
# def _():
#   # Make a GET request to fetch data from the external API
#   response = requests.get("https://abdulhamidsa.pythonanywhere.com/crimes")
  
#   # Check if the request was successful (status code 200)
#   if response.status_code == 200:
#     # Extract and log the JSON data
#     crimes_data = response.json()
#     ic(crimes_data)
    
#     # Return a success message
#     return "JSON data fetched and logged in the console"
#   else:
#     # Log an error if the request was not successful
#     ic("Error fetching JSON data. Status code:", response.status_code)
#     return "Error fetching JSON data"


  # Extract the suspects from the crime
  # The crime will be the same without suspect
 
  # suspects = crime["suspects"]
  # ic("#"*30)
  # ic(suspects)
 
 
  # Save the crime to the crimes collection, make sure
  # that you get back the crime's id: Eg: crimes/4565656
 
 
  # query = {
  #   "query": """
  #     INSERT @crime INTO crimes RETURN NEW
  #   """,
  #   "bindVars": {
  #     "crime": crime
  #   }
  # }
  # res = x.db(query)
  # ic(res)
 
  # # Get the id of the crime
  # crime_id = res["result"][0]["_id"]
  # ic(crime_id)
  # # res->result->0->_id
  # # return "crimes saved in arangodb"
 
 
  # query = {
  #   "query": """
  #     INSERT @suspect INTO suspects RETURN NEW
  #   """,
  #   "bindVars": {
  #     "suspect": suspects[0]
  #   }
  # }
  # res = x.db(query)
  # suspects_id = res["result"][0]["_id"]
  # ic(suspects_id)
 
  # # Gold Challenge
  # # Insert the crime and the suspect in the edge collection
 
  # doc = {"_from":crime_id, "_to":suspects_id}
  # query = {
  #   "query": """
  #     INSERT @doc INTO crimes_commited_by_suspects RETURN NEW
  #   """,
  #   "bindVars": {
  #     "doc": doc
  #   }
  # }
  # x.db(query)
 
  # return "crimes and suspects saved in arangodb"