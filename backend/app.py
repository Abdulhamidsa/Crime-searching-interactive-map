from bottle import get, template, static_file, response
import x  # Assuming 'x' is your database client for ArangoDB
from icecream import ic  # For debugging output
import requests  # To make HTTP requests
import json  # For JSON handling
from dotenv import load_dotenv  # To load environment variables from a .env file
import os  # For operating system interactions

##############################

# Load environment variables from a .env file
load_dotenv('.env')
username = os.getenv('username')
token = os.getenv('token')

##############################

# CHECK TOKEN IF MATCH
def check_token(username, token):
    # Make a GET request to check the validity of the token
    response = requests.get(
        f'https://www.pythonanywhere.com/api/v0/user/{username}/cpu/',
        headers={'Authorization': f'Token {token}'}
    )
    return response.status_code  # Return the status code of the response

################################

# END POINTS - GET REQUEST
@get("/")
def _():
    # Print a debug message and return a confirmation string that the backend is running
    ic("xxxxxxx")
    return "BACKEND RUNNING READY FOR REQUESTS "

################################

@get("/get-crimes")
def _():
    # Query to fetch all crimes from the 'crimes' collection
    query = {
        "query": """
            FOR crime IN crimes
            RETURN crime
        """
    }
    res = x.db(query)  # Execute the query using the database client
    if res["error"] == False:
        # Set response headers to allow cross-origin requests
        # response.headers["Access-Control-Allow-Origin"] = "*" 
        # response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"  
        # response.headers["Access-Control-Allow-Headers"] = "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"  
        response.content_type = "application/json"
        # Return the query results as JSON
        return json.dumps(res["result"])
    else:
        # Print an error message if the query fails
        print("Error fetching crimes. Error message:", res["errorMessage"])
        return "Error fetching crimes"

##############################

@get('/insert-crimes')
def get_crimes():
    # Check token validity
    if check_token(username, token) == 200:
        # Fetch crimes data from an external source
        crimes_response = requests.get('https://abdulhamidsa.pythonanywhere.com/crimes')
        if crimes_response.status_code == 200:
            # Extract JSON data from the response
            crimes_data = crimes_response.json()
            criminals_data = []  # List to store criminals data
            associates_data = []  # List to store associates data

            if crimes_data:
                for crime in crimes_data:
                    # Add criminal data if it exists
                    if crime['crime_perpetrator']:
                        crime['crime_perpetrator']['type'] = 'criminal'
                        crime['crime_perpetrator']['crime_type'] = crime['crime_type']  # Add the crime type to the criminal
                        criminals_data.append(crime['crime_perpetrator'])
                    # Add associates data if it exists
                    if crime.get('crime_associates'):
                        for associate in crime['crime_associates']:
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
                    res = x.db(query)  # Execute the query to insert the crime
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
                    res = x.db(query)  # Execute the query to insert the criminal
                # Insert the extracted associates into the associates collection
                for associate in associates_data:
                    query = {
                        "query": """
                            INSERT @associate INTO associates RETURN NEW
                        """,
                        "bindVars": {
                            "associate": associate
                        }
                    }
                    res = x.db(query)  # Execute the query to insert the associate
            return "Crimes, criminals, and associates data fetched and saved to the database"
        else:
            # Return an error message if the crime data fetch fails
            response.status = crimes_response.status_code
            return json.dumps({"error": "Failed to fetch crime data."})
    else:
        # Return an error message if the token is invalid
        return json.dumps({"error": "Token is invalid."})

##############################

@get('/get-potential-suspects/<criminal_id>')
def get_potential_suspects(criminal_id):
    # Query to find potential suspects related to a criminal
    query = f"""
        LET criminal_custom_id = "{criminal_id}"
        FOR criminal IN criminals
            FILTER criminal.id == criminal_custom_id
            FOR v, e, p IN OUTBOUND criminal._id relationships
                FILTER e.type == "potential suspect"
                RETURN v
        """
    payload = {
        "query": query
    }
    response = x.db(payload)  # Execute the query
    if not response.get("error"):
        return response  # Return the response if the query is successful
    else:
        # Raise an exception if the query fails
        raise Exception(f"Query failed with error message: {response.get('errorMessage')}")
##############################
