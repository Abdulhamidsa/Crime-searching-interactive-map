def arangoQuery(query, type = "cursor"):
    try:
        url = f"http://arangodb:8529/_api/{type}"
        response = requests.post(url, json=query)

        return response.json()
    except Exception as ex:
        error = f'Error: {ex}'
        print(error)
        return error
    finally:
        pass


def transactionQuery(crime, users):
    usersAndCrimes = ""
    for i, user in enumerate(users):
        usersAndCrimes += f'''
      var user{i} = db.users.firstExample({{"_key": "{user['cpr_number']}"}})
    if (user{i} == null) {{
        user{i} = db.users.save({{
            _key: "{user['cpr_number']}",
            "cpr_number": "{user['cpr_number']}",
            "first_name": "{user['first_name']}",
            "last_name": "{user['last_name']}",
            "age": {user['age']},
            "address": "{user['address']}",
            "image_url": "{user['image_url']}"
        }})
    }} else {{
        user{i} = db.users.update(user{i}, {{
            "first_name": "{user['first_name']}",
            "last_name": "{user['last_name']}",
            "age": {user['age']},
            "address": "{user['address']}",
            "image_url": "{user['image_url']}"
        }})
    }}
        db.crimes_involving_users.save({{
            "_from": crime._id,
            "_to": user{i}._id,
            "role": "{user['role']}"
        }})
        '''
        if user["relationships"]:
            for j, relationship in enumerate(user["relationships"]):
                usersAndCrimes += f'''
                var relationship{j} = db.users_associated_with_users.save({{
                    "_from": user{i}._id,
                    "_to": "users/{relationship['cpr_number']}",
                    "type": "{relationship['type']}"
                }})

                '''
    query = {
"collections": {
    "write": ["users", "crimes", "crimes_involving_users", "users_associated_with_users"]
},
"action": f"""
function () {{
var db = require('@arangodb').db;

var crime = db.crimes.save({{
"_key": "{crime['crime_id']}",
"type": "{crime['type_name']}",
"severity": {crime['severity']},
"committed_at": "{crime['committed_at']}",
"reported_at": "{crime['reported_at']}",
"added_at": "{crime['added_at']}",
"latitude": "{crime['latitude']}",
"longitude": "{crime['longitude']}"
}})

{usersAndCrimes}

return "success!";
}}
"""
}
    return arangoQuery(query, "transaction")
