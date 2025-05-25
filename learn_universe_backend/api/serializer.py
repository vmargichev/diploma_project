from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import Token
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from . import models as api_models

from userauths.models import Profile, User

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: User) -> Token:
        token = super().get_token(user)
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['username'] = user.username
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'password2']

    def validate(self, attr):

        if attr['password'] != attr['password2']:
            raise serializers.ValidationError({"password" : "Password fields does not match."})

        return attr

    def create(self, validated_data):
        user = User(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
        )

        user.username = user.email.split('@')[0]
        user.set_password(validated_data['password'])
        user.save()

        return user

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        exclude = ['password']

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = "__all__"

class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    refresh_token = serializers.CharField()
    otp = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        uidb64 = attrs.get("uidb64")
        refresh_token = attrs.get("refresh_token")
        otp = attrs.get("otp")
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        try:
            validate_password(password)
        except:
            raise serializers.ValidationError("Password is too easy.")

        if password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid user identifier.")

        if not default_token_generator.check_token(user, refresh_token):
            raise serializers.ValidationError("Invalid or expired token.")

        if user.otp != otp:
            raise serializers.ValidationError("Invalid or expired OTP.")

        # Save user to context so it can be used in view
        self.context["user"] = user
        return attrs

    def save(self):
        user = self.context["user"]
        password = self.validated_data["password"]

        user.set_password(password)
        user.otp = None  # Invalidate OTP
        user.save(update_fields=["password", "otp"])
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['id', 'title', 'image', 'slug', 'course_count']
        model = api_models.Category


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["user", "image", "full_name", "bio", "facebook", "twitter", "linkedin", "about", "country",
                  "students", "courses", "review", ]
        model = api_models.Teacher


class VariantItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.VariantItem

    def __init__(self, *args, **kwargs):
        super(VariantItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class VariantSerializer(serializers.ModelSerializer):
    variant_items = VariantItemSerializer(many=True)
    items = VariantItemSerializer(many=True)

    class Meta:
        fields = '__all__'
        model = api_models.Variant

    def __init__(self, *args, **kwargs):
        super(VariantSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class Question_Answer_MessageSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer_Message


class Question_AnswerSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageSerializer(many=True)
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Question_Answer


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Cart

    def __init__(self, *args, **kwargs):
        super(CartSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CartOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.CartOrderItem

    def __init__(self, *args, **kwargs):
        super(CartOrderItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CartOrderSerializer(serializers.ModelSerializer):
    order_item = CartOrderItemSerializer(many=True)

    class Meta:
        fields = '__all__'
        model = api_models.CartOrder

    def __init__(self, *args, **kwargs):
        super(CartOrderSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Certificate


class CompletedLessonSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.CompletedLesson

    def __init__(self, *args, **kwargs):
        super(CompletedLessonSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Note


class ReviewSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = api_models.Review

    def __init__(self, *args, **kwargs):
        super(ReviewSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Notification


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Coupon


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Wishlist

    def __init__(self, *args, **kwargs):
        super(WishlistSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = api_models.Country


class EnrolledCourseSerializer(serializers.ModelSerializer):
    lectures = VariantItemSerializer(many=True, read_only=True)
    completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum = VariantSerializer(many=True, read_only=True)
    note = NoteSerializer(many=True, read_only=True)
    question_answer = Question_AnswerSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)

    class Meta:
        fields = '__all__'
        model = api_models.EnrolledCourse

    def __init__(self, *args, **kwargs):
        super(EnrolledCourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CourseSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, required=False, read_only=True, )
    curriculum = VariantSerializer(many=True, required=False, read_only=True, )
    lectures = VariantItemSerializer(many=True, required=False, read_only=True, )
    reviews = ReviewSerializer(many=True, read_only=True, required=False)

    class Meta:
        fields = ["id", "category", "teacher", "file", "image", "title", "description", "price", "language", "level",
                  "platform_status", "teacher_course_status", "featured", "course_id", "slug", "date", "students",
                  "curriculum", "lectures", "average_rating", "rating_count", "reviews", ]
        model = api_models.Course

    def __init__(self, *args, **kwargs):
        super(CourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class StudentSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    completed_lessons = serializers.IntegerField(default=0)
    achieved_certificates = serializers.IntegerField(default=0)


class TeacherSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    total_students = serializers.IntegerField(default=0)
    total_revenue = serializers.IntegerField(default=0)
    monthly_revenue = serializers.IntegerField(default=0)


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
