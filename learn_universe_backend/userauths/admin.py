from django.contrib import admin
from userauths.models import Profile, User

# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass ##TODO

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    pass ##TODO


