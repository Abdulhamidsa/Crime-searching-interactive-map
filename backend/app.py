from bottle import get, response
import x  # Assuming 'x' is your database client for ArangoDB
from icecream import ic  # For debugging output
import requests  # To make HTTP requests
import json  # For JSON handling
from decouple import config

##############################

# Load environment variables from a .env file
username = config('username')
token = config('token')

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
            FOR edge IN crime_criminal
                LET crime_id = edge._from
                    LET criminal_id = edge._to
                        LET crime = DOCUMENT('crimes', crime_id)
                            LET criminal = DOCUMENT('criminals', criminal_id)
            RETURN MERGE(crime, { criminal: criminal })
        """
    }
    res = x.db(query)  # Execute the query using the database client
    if res["error"] == False:
        response.content_type = "application/json"
        # Return the query results as JSON
        return json.dumps(res["result"])
    else:
        # Print an error message if the query fails
        ic("Error fetching crimes. Error message:", res["errorMessage"])
        return "Error fetching crimes"

##############################

def transactionQuery(crimes, criminals, associates):
    crimesInsert = ""
        ## enumerate() function is used to loop through the list of criminals
    for i, crime in enumerate(crimes):
            # Convert victims to a JSON-compatible string
            victims = json.dumps(crime.get('crime_victims', []))
            crimesInsert += f'''
            var crime{i} = db.crimes.firstExample({{"_key": "{crime['_key']}"}})
            if (crime{i} == null) {{
                crime{i} = db.crimes.save({{
                    _key: "{crime['_key']}",
                    "crime_type": "{crime['crime_type']}",
                    "crime_city": "{crime['crime_city']}",
                    "crime_committed_at": "{crime['crime_committed_at']}",
                    "crime_description": "{crime['crime_description']}",
                    "crime_severity": {crime['crime_severity']},
                    "crime_location": {{"latitude": {crime['crime_location']['latitude']}, "longitude": {crime['crime_location']['longitude']}}},
                    "crime_report_time": "{crime['crime_report_time']}",
                    "crime_victims": {victims}
                }})
            }}
            '''
    criminalsInsert = ""
        ## enumerate() function is used to loop through the list of criminals

    for i, criminal in enumerate(criminals):
        criminalsInsert += f'''
        var criminal{i} = db.criminals.firstExample({{"_key": "{criminal['_key']}"}})
        if (criminal{i} == null) {{
            criminal{i} = db.criminals.save({{
                _key: "{criminal['_key']}",
                "id": "{criminal['id']}",
                "first_name": "{criminal['first_name']}",
                "last_name": "{criminal['last_name']}",
                "age": {criminal['age']},
                "gender": "{criminal['gender']}",
                "city": "{criminal['city']}",
                "location": {{"latitude": {criminal['location']['latitude']}, "longitude": {criminal['location']['longitude']}}},
                "avatar": "{criminal['avatar']}",
                "type": "criminal",
                "crime_type": "{criminal['crime_type']}",
                "crime_id": "{criminal['crime_id']}"
            }})
        }}
        '''
    associatesInsert = ""
        ## enumerate() function is used to loop through the list of criminals
    for i, associate in enumerate(associates):
        associatesInsert += f'''
        var associate{i} = db.associates.firstExample({{"_key": "{associate['_key']}"}})
        if (associate{i} == null) {{
            associate{i} = db.associates.save({{
                _key: "{associate['_key']}",
                "id": "{associate['id']}",
                "first_name": "{associate['first_name']}",
                "last_name": "{associate['last_name']}",
                "age": {associate['age']},
                "city": "{associate['city']}",
                "location": {{"latitude": {associate['location']['latitude']}, "longitude": {associate['location']['longitude']}}},
                "avatar": "{associate['avatar']}",
                "criminal_history": "{associate['criminal_history']}"
            }})
        }}
        '''
    # Insert edges to connect crimes and criminals based on shared crime_id, with type 'perpetrator'
    edgesInsertCriminals = ""
    ## enumerate() function is used to loop through the list of criminals
    for i, criminal in enumerate(criminals):
        edgesInsertCriminals += f'''
        var edge{i} = db.crime_criminal.firstExample({{"_from": "crimes/{criminal['crime_id']}", "_to": "criminals/{criminal['_key']}"}})
        if (edge{i} == null) {{
            db.crime_criminal.save({{
                _from: "crimes/{criminal['crime_id']}",
                _to: "criminals/{criminal['_key']}",
                "type": "perpetrator"
            }})
        }}
        '''
    edgesInsertSuspects = ""
    for criminal in criminals:
        for associate in associates:
            if (criminal['city'] == associate['city'] and 
                criminal['crime_type'] == associate['criminal_history']):
                relationship_type = "family" if criminal['last_name'] == associate['last_name'] else "potential suspect"
                edgesInsertSuspects += f'''
                var edge{i} = db.criminal_associate_relationship.firstExample({{"_from": "criminals/{criminal['_key']}", "_to": "associates/{associate['_key']}"}})
                if (edge{i} == null) {{
                db.criminal_associate_relationship.save({{
                    _from: "criminals/{criminal['_key']}",
                    _to: "associates/{associate['_key']}",
                    "type": "{relationship_type}"
                }})
            }}
            '''
    query = {
        "collections": {
            "write": ["criminals", "crimes", "associates", "crime_criminal", "criminal_associate_relationship"]
        },
        "action": f"""
        function () {{
            var db = require('@arangodb').db;
            {crimesInsert}
            {criminalsInsert}
            {associatesInsert}
            {edgesInsertSuspects}
            {edgesInsertCriminals}
            return "success!";
        }}
        """
    }
    return x.db(query, "transaction")

################################################################

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
            crimes_list = []  # List to store crimes data
            if crimes_data:
                for crime in crimes_data:
                    # Extract victims data
                    victims = crime.get('crime_victims', [])
                    # Append crime details to the crimes_list
                    crimes_list.append({
                        "_key": crime['crime_id'],
                        "crime_type": crime['crime_type'],
                        "crime_city": crime['crime_city'],
                        "crime_committed_at": crime['crime_committed_at'],
                        "crime_description": crime['crime_description'],
                        "crime_severity": crime['crime_severity'],
                        "crime_location": {"latitude": crime['crime_location']['latitude'], "longitude": crime['crime_location']['longitude']},
                        "crime_report_time": crime['crime_report_time'],
                        "crime_victims": victims  # Include victims' data
                    })
                    if crime['crime_perpetrator']:
                        crime['crime_perpetrator']['type'] = 'criminal'
                        crime['crime_perpetrator']['crime_type'] = crime['crime_type']  # Add the crime type to the criminal
                        criminals_data.append({
                            "_key": crime['crime_perpetrator']['id'],
                            "id": crime['crime_perpetrator']['id'],
                            "first_name": crime['crime_perpetrator']['first_name'],
                            "last_name": crime['crime_perpetrator']['last_name'],
                            "age": crime['crime_perpetrator']['age'],
                            "gender": crime['crime_perpetrator']['gender'],
                            "city": crime['crime_perpetrator']['city'],
                            "location": {"latitude": crime['crime_perpetrator']['location']['latitude'], "longitude": crime['crime_perpetrator']['location']['longitude']},
                            "avatar": crime['crime_perpetrator']['avatar'],
                            "type": "criminal",
                            "crime_type": crime['crime_type'],
                            "crime_id": crime['crime_id']
                        })
                    if crime.get('crime_associates'):
                        for associate in crime['crime_associates']:
                            associates_data.append({
                                "_key": associate['id'],
                                "id": associate['id'],
                                "first_name": associate['first_name'],
                                "last_name": associate['last_name'],
                                "age": associate['age'],
                                "city": associate['city'],
                                "location": {"latitude": associate['location']['latitude'], "longitude": associate['location']['longitude']},
                                "avatar": associate['avatar'],
                                "criminal_history": associate['criminal_history']
                            })

                # Call the transactionQuery function to insert data into the database
                result = transactionQuery(crimes_list, criminals_data, associates_data)
                return result
            else:
                response.status = 400
                return json.dumps({"error": "No crime data found."})
        else:
            response.status = crimes_response.status_code
            return json.dumps({"error": "Failed to fetch crime data."})
    else:
        response.status = 401
        return json.dumps({"error": "Token is invalid."})

##############################
@get('/get-potential-suspects/<criminal_id>')
def get_potential_suspects(criminal_id):
    # Query to find potential suspects related to a criminal
    query = """
        LET custom_id= @criminal_id
        FOR criminal IN criminals
            FILTER criminal.id == custom_id
            FOR v, e, p IN OUTBOUND criminal._id criminal_associate_relationship
                RETURN v
        """
    payload = {
        "query": query,
        "bindVars": {
            "criminal_id": criminal_id
        }
    }
    response = x.db(payload)  # Execute the query
    if not response.get("error"):
        return response  # Return the response if the query is successful
    else:
        # Raise an exception if the query fails
        raise Exception(f"Query failed with error message: {response.get('errorMessage')}")
