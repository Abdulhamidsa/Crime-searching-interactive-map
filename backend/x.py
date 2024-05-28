from bottle import response  # Importing the response object from the Bottle framework to manipulate HTTP responses.
from icecream import ic  # Importing the ic function from the icecream library for debugging (prints out variables and their values).
import requests  # Importing the requests library to make HTTP requests.

##############################
def db(query,type="cursor"):
    # This function sends a query to the ArangoDB server and returns the JSON response.
    try:
        url = f"http://arangodb:8529/_api/{type}"  # URL of the ArangoDB cursor API endpoint.
        res = requests.post(url, json=query)  # Sends a POST request to the URL with the query as a JSON payload.
        return res.json()  # Returns the response in JSON format.
    except Exception as ex:  # Catches any exception that occurs within the try block.
        print("#" * 50)  # Prints a line of hashes for visual separation in the output.
        print(ex)  # Prints the exception message.
    finally:
        pass  # The finally block is empty here, but it ensures the try-except structure is complete.
