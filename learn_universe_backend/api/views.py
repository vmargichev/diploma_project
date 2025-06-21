from decimal import Decimal

import requests
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import render, get_object_or_404, redirect
from django.http import Http404, HttpResponse
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from exceptiongroup import catch
# from networkx.algorithms.bipartite.cluster import modes
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from api import serializer as api_serializer
from api.enums import PlatformStatus, TeacherStatus, NotificationType
from api.models import Category, Course, Cart, Country, CartOrder, CartOrderItem, Coupon, Notification, EnrolledCourse
from api.serializer import PasswordResetConfirmSerializer
from api.utils import generate_otp, get_paypal_access_token
from userauths.models import User, Profile

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

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
            return Response({"message": "code or oid not found"}, status=status.HTTP_404_NOT_FOUND)

        coupon = Coupon.objects.get(code=coupon_code)
        order = CartOrder.objects.get(oid=oid)

        if coupon:
            if order.coupons.filter(id=coupon.id).exists():
                return Response({"message": "Coupon already applied."}, status=status.HTTP_200_OK)

            order_items = CartOrderItem.objects.filter(order=order, teacher=coupon.teacher)
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
            return Response({"message": "Coupon Successfully Aplied"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "coupon not found"}, status=status.HTTP_404_NOT_FOUND)

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
                            'currency': 'bgn',
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
                        Notification.objects.create(teacher=o.teachers,
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

                    return Response({"message": "Failed to retrieve Stripe session", "error": str(e)},
                                    status=status.HTTP_400_BAD_REQUEST)

                if session.payment_status == "paid":

                    if order.payment_status == "Processing":
                        order.payment_status = "Paid"

                        order.save()

                        Notification.objects.create(user=order.student, order=order, type=NotificationType.COURSE_ENROLLMENT_COMPLETED)

                        for o in order_items:
                            Notification.objects.create(teacher=o.teachers,
                                                        order=order,
                                                        order_item=o,
                                                        type=NotificationType.NEW_ORDER)
                            EnrolledCourse.objects.create(
                                course=o.course,
                                user=order.student,
                                teacher=o.teacher,
                                order_item=o,
                            )

                    return Response({"message": "Payment verified and order updated"}, status=status.HTTP_200_OK)

                else:

                    return Response({"message": f"Payment status is {session.payment_status}"},
                                    status=status.HTTP_400_BAD_REQUEST)

            else:

                return Response({"message": "No payment session_id provided"}, status=status.HTTP_400_BAD_REQUEST)

class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query')
        return Course.objects.filter(title__icontains=query, platform_status=PlatformStatus.PUBLISHED, teacher_course_status=TeacherStatus.PUBLISHED)