from random import randint

def generate_otp():
    return ''.join([str(randint(0, 9)) for i in range(6)]) ##TODO add 7 to constants of the model or sth like that