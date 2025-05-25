from decimal import Decimal

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render, get_object_or_404
from django.http import Http404, HttpResponse
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.response import Response
from rest_framework.views import APIView

from api import serializer as api_serializer
from api.enums import PlatformStatus, TeacherStatus
from api.models import Category, Course, Cart, Country
from api.serializer import PasswordResetConfirmSerializer
from api.utils import generate_otp
from userauths.models import User, Profile

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

# class PasswordResetEmailVerifyAPIView(generics.RetrieveAPIView):
#     permission_classes = [AllowAny]
#     serializer_class = api_serializer.UserSerializer
#
#     def get_object(self):
#         email = self.kwargs['email']
#
#         try:
#             user = User.objects.get(email = email)
#         catch:
#
#
#         uuid = user.uuid
#         refresh = RefreshToken.for_user(user)
#         refresh_token = str(refresh.access_token)
#
#         user.refresh_token = refresh_token
#         user.otp = generate_otp()
#         user.save()
#
#         link = f"http://127.0.0.1:8000/create-new-pass/?otp={user.otp}&uuid={uuid}&refresh_token={refresh_token}" ##TODO intro a const link or sth like that
#
#         context ={
#             "link" : link,
#             "username" : user.username,
#
#         }
#         subject = "Password Reset Email"
#
#         text_body = render_to_string("email/password_reset.txt", context)
#         html_body = render_to_string("email/password_reset.html", context)
#
#         msg = EmailMultiAlternatives(
#             subject=subject,
#             from_email=settings.FROM_EMAIL,
#             to=[user.email],
#             body=text_body,
#
#         )
#
#         msg.attach_alternative(html_body, "text/html")
#         msg.send()
#
#         return user
# class PasswordChangeAPIView(generics.CreateAPIView):
#     permission_classes = [AllowAny]
#     serializer_class = api_serializer.UserSerializer
#
#     def create(self, request, *args, **kwargs):
#
#         otp = request.data['otp']
#         uuid = request.data['uuid']
#         password = request.data['password']
#
#         user = User.objects.get(uuid = uuid, otp = otp)
#
#         if user:
#             return Response({"message" : "Password was changed successfully!"}, status = status.HTTP_201_CREATED)
#
#         else:
#             return Response({"message" : "User doesn`t Exist"}, status = status.HTTP_404_NOT_FOUND)

class PasswordResetEmailVerifyAPIView(generics.CreateAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = api_serializer.UserSerializer # serializer_class = YourEmailOnlySerializer # For validating request.data['email']

    def post(self, request, *args, **kwargs):
        email = self.kwargs['email']
        if not email:
            return Response({"error": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)  # Case-insensitive email lookup
        except User.DoesNotExist:
            # Prevent email enumeration. Log this attempt for security monitoring if desired.
            return Response({"detail": "If an account with this email exists, a password reset link has been sent."},
                            status=status.HTTP_200_OK)
        old_otp = user.otp
        user.otp = generate_otp()
        user.save(update_fields=['otp'])

        # Generate Django's password reset token
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)  # Time-sensitive token

        # Construct link (use settings for base URL)
        # Example: http://your-frontend.com/reset-password-confirm/<uidb64>/<token>/?otp=<otp_value>
        # frontend_reset_url_base = getattr(settings, 'FRONTEND_PASSWORD_RESET_CONFIRM_URL_BASE',
        #                                   'http://127.0.0.1:3000/reset-password-confirm/')
        #
        # if not frontend_reset_url_base.endswith('/'):
        #     frontend_reset_url_base += '/'
        #
        # link = f"{frontend_reset_url_base}{uidb64}/{token}/?otp={user.otp}"
        link = f"http://localhost:5173/create-new-pass/?otp={user.otp}&uidb64={uidb64}&refresh_token={token}"

        context = {
            "link": link,
            "username": user.username,
        }
        subject = "Password Reset Request"
        text_body = render_to_string("email/password_reset.txt", context)
        html_body = render_to_string("email/password_reset.html", context)
        msg = EmailMultiAlternatives(subject=subject, from_email=settings.FROM_EMAIL, to=[user.email], body=text_body)
        msg.attach_alternative(html_body, "text/html")

        try:
            msg.send()
        except Exception as e:
            # logger.error(f"Failed to send password reset email to {user.email}: {e}")
            # Consider if OTP should be reverted or if user should be informed of send failure
            return Response({"error": "Could not send password reset email. Please try again later."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "If an account with this email exists, a password reset link has been sent."},
                        status=status.HTTP_200_OK)

class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]

class CourseListAPIView(generics.ListAPIView):
    queryset = Course.objects.filter(platform_status=PlatformStatus.PUBLISHED, teacher_course_status=TeacherStatus.PUBLISHED)
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

class CourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = Course.objects.filter(platform_status=PlatformStatus.PUBLISHED, teacher_course_status=TeacherStatus.PUBLISHED)

    def get_object(self):
        return Course.objects.get(slug=self.kwargs["slug"], platform_status=PlatformStatus.PUBLISHED, teacher_course_status=TeacherStatus.PUBLISHED)

class CartAPIView(generics.CreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_pk = request.data.get("course")
        if not course_pk:
            return Response({"detail": "course_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(pk=course_pk)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        country_name = request.data.get("country")
        if not country_name:
            return Response({"detail": "country is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            country_obj = Country.objects.get(name=country_name, active=True)
        except Country.DoesNotExist:
            return Response({"detail": "Country not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user if request.user.is_authenticated else None

        if user and Cart.objects.filter(course=course, user=user).exists():
            return Response({"detail": "Course already in cart."}, status=status.HTTP_400_BAD_REQUEST)

        price = course.price or Decimal("0.00")
        tax_fee = price * (country_obj.tax_rate / Decimal("100"))
        total = price + tax_fee

        cart = Cart.objects.create(
            course=course,
            user=user,
            price=price,
            tax_fee=tax_fee,
            total=total,
            country=country_obj
        )

        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)