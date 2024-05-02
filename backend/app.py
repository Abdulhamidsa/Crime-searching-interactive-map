from bottle import Bottle, request, response, run
import requests
import json

app = Bottle()

# Function to check token against PythonAnywhere
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

@app.get('/crimes')
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

if __name__ == '__main__':
    run(app, host='localhost', port=8080, debug=True, reload=True)