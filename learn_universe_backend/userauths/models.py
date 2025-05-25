from django.db import models
import uuid

# Create your models here.

from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = models.CharField(unique = True, max_length = 30,)
    email = models.EmailField(unique = True,)
    full_name = models.CharField(max_length = 50)
    otp = models.CharField(max_length=6, null = True) ##Keep in mind this one
    refresh_token = models.CharField(max_length=1000, null = True)
    created_at = models.DateTimeField(auto_now_add=True)
    uuid = models.UUIDField(default=uuid.uuid4,editable=False , unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"] ##TODO

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split("@")[0]
        if not self.full_name:
            self.full_name = self.email.split("@")[0]

        super(User, self).save(*args, **kwargs)
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default = "default_profile_pic.jpg", null = True)
    full_name = models.CharField(max_length = 50)
    country = models.CharField(max_length = 30, null = True)
    about = models.TextField(max_length=200, null = True, blank = True)

    def save(self, *args, **kwargs):
        if not self.full_name:
            self.full_name = self.user.full_name

        super(Profile, self).save(*args, **kwargs)


