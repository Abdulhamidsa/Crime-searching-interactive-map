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
  return "5555"
 


@get("/crimes")
def _():
    query = {
        "query": """
            FOR crime IN crimes
            RETURN crime
        """
    }
    res = x.db(query)
    if res["error"] == False:
        response.content_type = 'application/json'
        return json.dumps(res["result"])
    else:
        ic("Error fetching crimes. Error message:", res["errorMessage"])
        return "Error fetching crimes"
##############################

def check_token(username, token):
    response = requests.get(
        'https://www.pythonanywhere.com/api/v0/user/{username}/cpu/'.format(
            username=username
        ),
        headers={'Authorization': 'Token {token}'.format(token=token)}
    )
    return response.status_code

username = 'Abdulhamidsa'
token = '2d49d619c5c231b2c7743d9ffaf3201980bf711a'

@get('/crimes')
def get_crimes():
    if check_token(username, token) == 200:
        crimes_response = requests.get('https://abdulhamidsa.pythonanywhere.com/crimes')
        if crimes_response.status_code == 200:
            return json.dumps(crimes_response.json())
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