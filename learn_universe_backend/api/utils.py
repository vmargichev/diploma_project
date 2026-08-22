from random import randint

import requests


def generate_otp():
    return ''.join([str(randint(0, 9)) for i in range(6)]) ##TODO add 7 to constants of the model or sth like that

def get_paypal_access_token(client_id, secret_key):
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    headers = {
        "Accept": "application/json",
        "Accept-Language": "en_US",
    }
    data = {
        'grant_type': 'client_credentials'
    }
    auth = (client_id, secret_key)

    response = requests.post(token_url, headers=headers, data=data, auth=auth)
    if response.status_code == 200:
        token_info = response.json()
        return token_info.get('access_token')
    else:
        raise Exception(f"Failed to get access token: {response.status_code} {response.text}")