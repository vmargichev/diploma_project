from datetime import datetime, timedelta
from decimal import Decimal
from distutils.util import strtobool

import requests
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.db import transaction
from django.db.models import Sum, Count
from django.db.models.functions import ExtractMonth
from django.utils.autoreload import raise_last_exception
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render, get_object_or_404, redirect
from django.http import Http404, HttpResponse
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from exceptiongroup import catch
# from networkx.algorithms.bipartite.cluster import modes
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet

from api import serializer as api_serializer
from api.enums import PlatformStatus, TeacherStatus, NotificationType
from api.models import Category, Course, Cart, Country, CartOrder, CartOrderItem, Coupon, Notification, EnrolledCourse, \
    Teacher, Question_Answer_Message, Question_Answer, Wishlist, Review, CompletedLesson, Certificate, VariantItem, \
    Note, Variant
from api.serializer import PasswordResetConfirmSerializer, ProfileSerializer, CourseSerializer
from api.utils import generate_otp, get_paypal_access_token
from userauths.models import User, Profile

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

class PasswordResetEmailVerifyAPIView(generics.CreateAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = api_serializer.UserSerializer

    def post(self, request, *args, **kwargs):
        email = self.kwargs['email']
        if not email:
            return Response({"error": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "If an account with this email exists, a password reset link has been sent."},
                            status=status.HTTP_200_OK)
        old_otp = user.otp
        user.otp = generate_otp()
        user.save(update_fields=['otp'])

        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)  # Time-sensitive token

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
            return Response({"error": "Could not send password reset email. Please try again later."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "If an account with this email exists, a password reset link has been sent."},
                        status=status.HTTP_200_OK)


class EmailTeacherRequestAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        user_id = kwargs.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id  is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "If an account with this email exists, an admin notification has been sent."},
                status=status.HTTP_200_OK
            )

        admin_url = f"http://127.0.0.1:8000/admin/userauths/user/{user.id}/change/"

        context = {
            "admin_url": admin_url,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name if hasattr(user, 'full_name') else user.username,
        }

        subject = "New Teacher Registration Request"
        text_body = render_to_string("email/teacher_request.txt", context)
        html_body = render_to_string("email/teacher_request.html", context)

        msg = EmailMultiAlternatives(
            subject=subject,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=["vesko1410@gmail.com"],
            body=text_body
        )
        msg.attach_alternative(html_body, "text/html")

        try:
            msg.send()
            return Response(
                {"detail": "If an account with this email exists, an admin notification has been sent."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Could not send admin notification email. Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    queryset = Course.objects.filter(platform_status=PlatformStatus.PUBLISHED, teacher_course_status=TeacherStatus.PUBLISHED).annotate(
    student_count=Count('enrolledcourse') ).order_by('-student_count')
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

class CourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = Course.objects.filter(
        platform_status=PlatformStatus.PUBLISHED,
        teacher_course_status=TeacherStatus.PUBLISHED
    ).select_related('category', 'teacher')
    lookup_field = 'slug'

    def get_object(self):
        try:
            return get_object_or_404(
                self.get_queryset(),
                slug=self.kwargs['slug']
            )
        except Exception as e:
            raise NotFound(detail="Course not found") from e

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

        # user = request.user if request.user.is_authenticated else None #TODO maybe is_auth is good should check it
        user = User.objects.get(pk=request.data.get("user"))

        if user and Cart.objects.filter(course=course, user=user).exists():
            return Response({"detail": "Course already in cart."}, status=status.HTTP_400_BAD_REQUEST)

        if user and EnrolledCourse.objects.filter(course=course, user=user).exists():
            return Response({"detail": "Already enrolled for the course."}, status=status.HTTP_400_BAD_REQUEST)


        price = course.price or Decimal("0.00")
        tax_fee = price * (country_obj.tax_rate / Decimal("100"))
        total = price + tax_fee

        cart_id = request.data.get("cart_id")
        if not cart_id or cart_id == "undefined" or cart_id == "Null" or cart_id == "":
            cart = Cart.objects.create(
                course=course,
                user=user,
                price=price,
                tax_fee=tax_fee,
                total=total,
                country=country_obj,
            )
        else:
            cart = Cart.objects.create(
                course=course,
                user=user,
                price=price,
                tax_fee=tax_fee,
                total=total,
                country=country_obj,
                cart_id=cart_id,
        )

        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CartListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart_id = self.kwargs.get("cart_id")
        if not cart_id:
            return Cart.objects.none()
        return Cart.objects.filter(cart_id=cart_id)

class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs["cart_id"]
        course = self.kwargs["course"]

        try:
            return Cart.objects.get(cart_id=cart_id, course_id=course)
        except Cart.DoesNotExist:
            raise NotFound("Cart item not found.")

# class CartStatAPIView(generics.RetrieveAPIView):
#     queryset = Cart.objects.all()
#     serializer_class = api_serializer.CartSerializer
#     permission_classes = [AllowAny]
#     lookup_field = "cart_id"
#
#     def get(self, request, *args, **kwargs):
#
#         queryset = self.get_queryset()
#
#         total_price = 0.00
#         total_tax = 0.00
#         total_total = 0.00
#
#         for item in queryset:
#             total_price += float(item.price)
#             total_tax += float(item.tax_fee)
#             total_total += float(item.total)
#
#         return Response({"price": total_price,
#                          "tax": total_tax,
#                          "total": round(total_total, 2), })

class CartStatsAPIView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, cart_id):
        carts = Cart.objects.filter(cart_id=cart_id)

        total_price = sum(float(c.price) for c in carts)
        total_tax = sum(float(c.tax_fee) for c in carts)
        total_total = sum(float(c.total) for c in carts)

        return Response({
            "total_price": total_price,
            "total_tax": total_tax,
            "total_total": round(total_total, 2),
        })

class CartOrderCreateAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = CartOrder.objects.all()
    serializer_class = api_serializer.CartOrderSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        full_name = data.get("full_name")
        email = data.get("email")
        country = data.get("country")
        cart_id = data.get("cart_id")
        user_id = data.get("user_id")

        if not user_id or not cart_id:
            return Response({"detail": "user_id and cart_id are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        cart_items = Cart.objects.filter(cart_id=cart_id)

        if not cart_items.exists():
            return Response({"detail": "No cart items found."}, status=status.HTTP_404_NOT_FOUND)

        total_price = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_initial_total = Decimal("0.00")
        total_total = Decimal("0.00")

        with transaction.atomic():
            order = CartOrder.objects.create(
                full_name=full_name,
                email=email,
                country=country,
                student=user,
            )

            for item in cart_items:
                CartOrderItem.objects.create(
                    order=order,
                    course=item.course,
                    price=item.price,
                    tax_fee=item.tax_fee,
                    total=item.total,
                    initial_total=item.total,
                    teacher=item.course.teacher,
                )

                order.teachers.add(item.course.teacher)

                total_price += item.price
                total_tax += item.tax_fee
                total_initial_total += item.total
                total_total += item.total

            order.sub_total = total_price
            order.tax_fee = total_tax
            order.initial_total = total_initial_total
            order.total = total_total
            order.save()

        return Response({"message": "Order created successfully.", "order_oid": order.oid }, status=status.HTTP_201_CREATED)

class OrderCheckoutAPIView(generics.RetrieveAPIView):
    queryset = CartOrder.objects.all()
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    lookup_field = "oid"

class CouponApplyAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        coupon_code = request.data.get("coupon_code")
        oid = request.data.get("oid")

        if not coupon_code or not oid:
            return Response({"message": "No Input was specified", "flag": "error"}, status=status.HTTP_404_NOT_FOUND)

        try:
            coupon = Coupon.objects.get(code=coupon_code)

        except  Coupon.DoesNotExist:
            return Response({"message": "No order item found", "flag": "error"}, status=status.HTTP_404_NOT_FOUND)

        try:
            order = CartOrder.objects.get(oid=oid)

        except  CartOrder.DoesNotExist:
            return Response({"message": "No order item found", "flag": "error"}, status=status.HTTP_404_NOT_FOUND)

        if coupon:
            if order.coupons.filter(id=coupon.id).exists():
                return Response({"message": "Coupon already applied.", "flag": "warning" }, status=status.HTTP_200_OK)
            try:
                order_items = CartOrderItem.objects.filter(order=order, teacher_id=coupon.teacher)
            except  CartOrderItem.DoesNotExist:
                return Response({"message": "No order item found", "flag": "error"}, status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                for item in order_items:
                    discount = item.price * coupon.discount / 100
                    item.total -= discount
                    item.price -= discount
                    item.saved += discount
                    item.applied_coupon = True
                    item.coupons.add(coupon)

                    order.coupons.add(coupon)
                    order.total -= discount
                    order.sub_total -= discount
                    order.saved += discount

                    item.save()
                    order.save()
                    coupon.used_by.add(order.student)
            return Response({"message": "Coupon Successfully Applied", "flag": "success"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "coupon not found", "flag": "warning"}, status=status.HTTP_404_NOT_FOUND)

class StripeCheckoutAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):

        order_id = self.kwargs['order_id']
        order = CartOrder.objects.get(oid=order_id)

        if not order:
            return Response({"message": "Order Not Found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email = order.email,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'eur',
                            'product_data' : {
                                'name' : order.full_name,
                            },
                            'unit_amount': int(order.total * 100)
                        },
                        'quantity': 1
                    },
                ],
                mode='payment',
                success_url = f"{settings.FRONTEND_SITE_URL}payment-success/{order_id}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url = f"{settings.FRONTEND_SITE_URL}payment-failed/"
            )

            order.stripe_session_id = checkout_session.id

            return redirect(checkout_session.url)
        except stripe.error.StripeError as e:
            return Response({"message": f"Something went wrong during payment Error {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class PaymentSuccessAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    queryset = CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        session_id = request.data.get('session_id')
        paypal_order_id = request.data.get('paypal_order_id')

        try:
            order = CartOrder.objects.get(oid=order_id)
            order_items = CartOrderItem.objects.filter(order=order)
        except CartOrder.DoesNotExist:
            return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if paypal_order_id:
            # First, get PayPal access token (reuse your function or inline here)
            try:
                access_token = get_paypal_access_token(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET)
            except Exception as e:
                return Response({"message": "Failed to get PayPal access token", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            paypal_api_url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{paypal_order_id}"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }

            paypal_response = requests.get(paypal_api_url, headers=headers)
            if paypal_response.status_code == 200:
                order_data = paypal_response.json()
                # Check order status
                if order_data.get("status") == "COMPLETED":
                    # Mark order as paid, update your DB as needed
                    order.is_paid = True
                    order.save()
                    # You can also process order items here if needed

                    Notification.objects.create(user=order.student, order=order,
                                                type=NotificationType.COURSE_ENROLLMENT_COMPLETED)

                    for o in order_items:
                        Notification.objects.create(teacher=o.teacher,
                                                    order=order,
                                                    order_item=o,
                                                    type=NotificationType.NEW_ORDER)
                        EnrolledCourse.objects.create(
                            course=o.course,
                            user=order.student,
                            teacher=o.teacher,
                            order_item=o,
                        )

                    return Response({"message": "Payment successful and verified with PayPal"}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": f"PayPal order status is {order_data.get('status')}, not completed"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message": "Failed to verify PayPal order", "details": paypal_response.text}, status=status.HTTP_400_BAD_REQUEST)
        else:

            if session_id:

                try:

                    session = stripe.checkout.Session.retrieve(session_id)

                except Exception as e:

                    return Response({"message": "Payment Failed", "error": str(e)},
                                    status=status.HTTP_400_BAD_REQUEST)

                if session.payment_status == "paid":

                    if order.payment_status == "Processing":
                        order.payment_status = "Paid"

                        order.save()

                        Notification.objects.create(user=order.student, order=order, type=NotificationType.COURSE_ENROLLMENT_COMPLETED)
                        for o in order_items:

                            Notification.objects.create(teacher=o.teacher,
                                                        order=order,
                                                        order_item=o,
                                                        type=NotificationType.NEW_ORDER)
                            EnrolledCourse.objects.get_or_create(
                                course=o.course,
                                user=order.student,
                                teacher=o.teacher,
                                order_item=o,
                            )

                    return Response({"message": "Payment Successful"}, status=status.HTTP_200_OK)

                else:

                    return Response({"message": "Payment Failed"},
                                    status=status.HTTP_400_BAD_REQUEST)

            else:

                return Response({"message": "No payment session_id provided"}, status=status.HTTP_400_BAD_REQUEST)

class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query')
        return Course.objects.filter(title__icontains=query, platform_status=PlatformStatus.PUBLISHED, teacher_course_status=TeacherStatus.PUBLISHED)


class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        total_courses = EnrolledCourse.objects.filter(user=user).count()
        completed_lessons = CompletedLesson.objects.filter(user=user).count()
        achieved_certificates = Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_courses,
            "completed_lessons": completed_lessons,
            "achieved_certificates": achieved_certificates,
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return EnrolledCourse.objects.filter(user=user)


class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        return EnrolledCourse.objects.get(user=user, enrollment_id=enrollment_id)


class StudentCourseCompletedCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CompletedLessonSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        variant_item_id = request.data['variant_item_id']

        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)
        variant_item = VariantItem.objects.get(variant_item_id=variant_item_id)

        completed_lessons = CompletedLesson.objects.filter(user=user, course=course,
                                                                      variant_item=variant_item).first()

        if completed_lessons:
            completed_lessons.delete()
            return Response({"message": "Course marked as not completed"})

        else:
            CompletedLesson.objects.create(user=user, course=course, variant_item=variant_item)
            return Response({"message": "Course marked as completed"})


class StudentNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        enrolled = EnrolledCourse.objects.get(enrollment_id=enrollment_id)

        return Note.objects.filter(user=user, course=enrolled.course)

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        enrollment_id = request.data['enrollment_id']
        title = request.data['title']
        note = request.data['note']

        user = User.objects.get(id=user_id)
        enrolled = EnrolledCourse.objects.get(enrollment_id=enrollment_id)

        Note.objects.create(user=user, course=enrolled.course, note=note, title=title)

        return Response({"message": "Note created successfullly"}, status=status.HTTP_201_CREATED)


class StudentNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        user = User.objects.get(id=user_id)
        if self.request.user != user:
            raise PermissionDenied(f"No rights {self.request.user}")
        enrolled = EnrolledCourse.objects.get(enrollment_id=enrollment_id)
        note = Note.objects.get(user=user, course=enrolled.course, id=note_id)
        return note


class StudentRateCourseCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        rating = request.data['rating']
        review = request.data['review']

        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)

        Review.objects.create(
            user=user,
            course=course,
            review=review,
            rating=rating,
            active=True,
        )

        return Response({"message": "Review created successfullly"}, status=status.HTTP_201_CREATED)


class StudentRateCourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = User.objects.get(id=user_id)
        return Review.objects.get(id=review_id, user=user)

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            "message": "Review updated successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class StudentWishListListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishlistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return Wishlist.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']

        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)

        wishlist = Wishlist.objects.filter(user=user, course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message": "Wishlist Deleted"}, status=status.HTTP_200_OK)
        else:
            Wishlist.objects.create(
                user=user, course=course
            )
            return Response({"message": "Wishlist Created"}, status=status.HTTP_201_CREATED)


class QuestionAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        course = Course.objects.get(id=course_id)
        return Question_Answer.objects.filter(course=course)

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        title = request.data['title']
        message = request.data['message']

        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)

        question = Question_Answer.objects.create(
            course=course,
            user=user,
            title=title
        )

        Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        return Response({"message": "Group conversation Started"}, status=status.HTTP_201_CREATED)


class QuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        qa_id = request.data['qa_id']
        user_id = request.data['user_id']
        message = request.data['message']

        if not all([course_id, qa_id, user_id, message]):
            raise ValidationError("Missing required fields")

        user = get_object_or_404(User, id=user_id)
        course = get_object_or_404(Course, id=course_id)
        question = get_object_or_404(Question_Answer, qa_id=qa_id)
        Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        question_serializer = api_serializer.Question_AnswerSerializer(question)
        return Response({"messgae": "Message Sent", "question": question_serializer.data})


class TeacherSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.TeacherSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)

        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = Course.objects.filter(teacher=teacher).count()
        total_revenue = \
        CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid").aggregate(
            total_revenue=Sum("price"))['total_revenue'] or 0
        monthly_revenue = CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid",
                                                                  date__gte=one_month_ago).aggregate(
            total_revenue=Sum("price"))['total_revenue'] or 0

        enrolled_courses = EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return [{
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "total_students": len(students),
        }]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TeacherCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Course.objects.filter(teacher=teacher)


class TeacherReviewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Review.objects.filter(course__teacher=teacher)


class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Review.objects.get(course__teacher=teacher, id=review_id)

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            "message": "Review updated successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)



class TeacherStudentsListAPIVIew(ViewSet):

    def list(self, request, teacher_id=None):
        teacher = Teacher.objects.get(id=teacher_id)

        enrolled_courses = EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_courses:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name": user.profile.full_name,
                    "image": f"http://127.0.0.1:8000{user.profile.image.url}",
                    "country": user.profile.country,
                    "date": course.date
                }

                students.append(student)
                unique_student_ids.add(course.user_id)

        return Response(students)


@api_view(("GET",))
def TeacherAllMonthEarningAPIView(request, teacher_id):
    teacher = Teacher.objects.get(id=teacher_id)
    monthly_earning_tracker = (
        CartOrderItem.objects
        .filter(teacher=teacher, order__payment_status="Paid")
        .annotate(
            month=ExtractMonth("date")
        )
        .values("month")
        .annotate(
            total_earning=Sum("price")
        )
        .order_by("month")
    )

    return Response(monthly_earning_tracker)


class TeacherBestSellingCourseAPIView(ViewSet):

    def list(self, request, teacher_id=None):
        teacher = Teacher.objects.get(id=teacher_id)
        courses_with_total_price = []
        courses = Course.objects.filter(teacher=teacher)

        for course in courses:
            revenue = course.enrolledcourse_set.aggregate(total_price=Sum('order_item__price'))[
                          'total_price'] or 0
            sales = course.enrolledcourse_set.count()

            courses_with_total_price.append({
                'course_image': course.image.url,
                'course_title': course.title,
                'revenue': revenue,
                'sales': sales,
            })

        return Response(courses_with_total_price)


class TeacherCourseOrdersListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)

        return CartOrderItem.objects.filter(teacher=teacher)


class TeacherQuestionAnswerListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Question_Answer.objects.filter(course__teacher=teacher)


class TeacherCouponListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Coupon.objects.filter(teacher=teacher)


class TeacherCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        coupon_id = self.kwargs['coupon_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Coupon.objects.get(teacher=teacher, id=coupon_id)


class TeacherNotificationListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Notification.objects.filter(teacher=teacher, seen=False)


class TeacherNotificationDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        noti_id = self.kwargs['noti_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Notification.objects.get(teacher=teacher, id=noti_id)


class CourseCreateAPIView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        teacher_id = self.request.data.get('teacher')

        if teacher_id:
            teacher = Teacher.objects.get(id=teacher_id)
        else:
            teacher = self.request.user.teacher

        serializer.is_valid(raise_exception=True)
        course_instance = serializer.save(teacher=teacher)

        variant_data = []
        for key, value in self.request.data.items():
            if key.startswith('variant') and '[variant_title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value

                variant_dict = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in self.request.data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}

                        current_item.update({field_name: item_value})

                if current_item:
                    item_data_list.append(current_item)

                variant_data.append({'variant_dict': variant_dict,
                                     'variant_item_data': item_data_list})
        for data_entry in variant_data:
            variant = Variant.objects.create(title=data_entry['variant_dict']['title'], course = course_instance)

            for item_data in data_entry['variant_item_data']:
                preview_value=item_data.get("preview")
                preview = bool(strtobool(preview_value)) if preview_value is not None else False

                VariantItem.objects.create(
                    variant=variant,
                    title = item_data.get("title"),
                    description=item_data.get("description"),
                    file=item_data.get("file"),
                    preview=preview,
                )
    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance)


class ClearCartAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs.get('cart_id')
        try:

            Cart.objects.get(cart_id=cart_id)
            return cart_id
        except Cart.DoesNotExist:
            return None

    def destroy(self, request, *args, **kwargs):
        cart_id = self.get_object()
        if not cart_id:
            return Response(
                {"error": "Cart not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        deleted_count, _ = Cart.objects.filter(cart_id=cart_id).delete()

        return Response(
            {
                "message": "Cart cleared successfully",
                "items_deleted": deleted_count
            },
            status=status.HTTP_200_OK
        )

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        print(self.kwargs)
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return Profile.objects.get(user=user)


class CourseDeleteAPIView(generics.DestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Ownership verification
        if instance.teacher.user != request.user:
            raise PermissionDenied(
                {"detail": "You can only delete your own courses"},
                code=status.HTTP_403_FORBIDDEN
            )

        # Check if already disabled
        if instance.platform_status == PlatformStatus.DISABLED:
            return Response(
                {
                    "status": "success",
                    "code": status.HTTP_200_OK,
                    "message": "Course was already disabled",
                    "data": {
                        "course_id": instance.id,
                        "current_status": PlatformStatus.DISABLED.label
                    }
                },
                status=status.HTTP_200_OK
            )

        # Soft delete implementation
        instance.platform_status = PlatformStatus.DISABLED
        instance.save()

        return Response(
            {
                "status": "success",
                "code": status.HTTP_200_OK,
                "message": "Course successfully disabled",
                "data": {
                    "course_id": instance.id,
                    "previous_status": instance._original_platform_status,  # Track state change
                    "new_status": PlatformStatus.DISABLED.label
                }
            },
            status=status.HTTP_200_OK
        )


class TeacherCourseDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return super().get_queryset().filter(teacher__user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()

        variants_data = self.request.data.get('variants', [])
        self._update_variants(instance, variants_data)

        return Response({
            "status": "success",
            "message": "Course updated successfully",
            "data": CourseSerializer(instance).data
        })

    def _update_variants(self, course, variants_data):
        existing_variant_ids = [v['id'] for v in variants_data if 'id' in v]
        course.variants.exclude(id__in=existing_variant_ids).delete()

        for variant_data in variants_data:
            variant_id = variant_data.get('id')
            items_data = variant_data.pop('items', [])

            if variant_id:
                variant = Variant.objects.get(id=variant_id)
                for attr, value in variant_data.items():
                    setattr(variant, attr, value)
                variant.save()
            else:
                variant = Variant.objects.create(course=course, **variant_data)

            self._update_variant_items(variant, items_data)

    def _update_variant_items(self, variant, items_data):
        existing_item_ids = [i['id'] for i in items_data if 'id' in i]
        variant.items.exclude(id__in=existing_item_ids).delete()

        for item_data in items_data:
            item_id = item_data.get('id')
            if item_id:
                item = VariantItem.objects.get(id=item_id)
                for attr, value in item_data.items():
                    setattr(item, attr, value)
                item.save()
            else:
                VariantItem.objects.create(variant=variant, **item_data)


class CourseVariantDeleteAPIView(APIView):
    def delete(self, request, variant_id, teacher_id, course_id):
        try:
            variant = Variant.objects.get(
                id=variant_id,
                course__id=course_id,
                course__teacher__user_id=teacher_id
            )

            variant.delete()

            return Response(
                {"message": "Variant deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except Variant.DoesNotExist:
            return Response(
                {"error": "Variant not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST

            )
class VariantItemDestroyAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantItemSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'variant_item_id'

    def get_queryset(self):
        return VariantItem.objects.filter(
            variant_id=self.kwargs['variant_id'],
            variant__course__teacher__user=self.request.user
        )

    def perform_destroy(self, instance):
        if instance.file:
            instance.file.delete(save=False)
        super().perform_destroy(instance)


class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]


class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        teacher_id = self.kwargs.get('teacher_id')
        course_id = self.kwargs.get('course_id')

        try:
            course = Course.objects.select_related('teacher').prefetch_related(
                'variants__variant_items'
                ).get(
                    id=course_id,
                    teacher_id=teacher_id
                )

            if course.teacher.user != self.request.user:
                raise PermissionDenied("You don't own this course")

            return course

        except Course.DoesNotExist:
            raise NotFound("Course not found or you don't have permission")

    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request.data['image']) == "No File":
            course.image = None

        if 'file' in request.data and not str(request.data['file']).startswith("http://"):
            course.file = request.data['file']

        if 'category' in request.data['category'] and request.data['category'] != 'NaN' and request.data[
            'category'] != "undefined":
            category = Category.objects.get(id=request.data['category'])
            course.category = category

        self.perform_update(serializer)
        self.update_variant(course, request.data)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance)

    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:

                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                variant_data = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})

                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variants.filter(id=variant_id).first()

                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = VariantItem.objects.filter(
                            variant_item_id=item_data.get("variant_item_id")).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            if item_data.get("file") != "null":
                                file = item_data.get("file")
                            else:
                                file = None

                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )

                        else:
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    preview=preview
                                )

                        variant_item.save()

                else:
                    new_variant = Variant.objects.create(
                        course=course, title=title
                    )

                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )