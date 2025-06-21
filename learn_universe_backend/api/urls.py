from api import views as api_views
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path("user/token", api_views.MyTokenObtainPairView.as_view(), name="token_obtain"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("user/register/", api_views.RegisterView.as_view(), name="register"),
    path("user/reset-pass/<email>/", api_views.PasswordResetEmailVerifyAPIView.as_view(), name="password_reset"),
    path("user/change-pass/", api_views.PasswordChangeAPIView.as_view(), name="password_change"),

    # Core - Course
    path("course/category", api_views.CategoryListAPIView.as_view(), name="category_list"),
    path("course/course-list", api_views.CourseListAPIView.as_view(), name="course_list"),
    path("course/course-detail/<slug>/", api_views.CourseDetailAPIView.as_view(), name="course_detail"),

    # Cart
    path("course/cart", api_views.CartAPIView.as_view(), name="cart_create"),
    path("course/cart-list/<cart_id>/", api_views.CartListAPIView.as_view(), name="cart_list"),
    path("course/cart-item-delete/<cart_id>/<course>/", api_views.CartItemDeleteAPIView.as_view(), name="cart_item_delete"),
    path("cart/stats/<cart_id>/", api_views.CartStatsAPIView.as_view(), name="cart_stats"),

    # Order
    path("order/create-order/", api_views.CartOrderCreateAPIView.as_view(), name="order_create"),
    path("order/checkout/<oid>/", api_views.OrderCheckoutAPIView.as_view(), name="order_checkout"),
    path("order/coupon/", api_views.CouponApplyAPIView.as_view(), name="coupon_apply"),
    path("payment/stripe-checkout/<order_id>/", api_views.StripeCheckoutAPIView.as_view(), name="stripe_checkout"),
    path("payment/payment-success/<order_id>/", api_views.PaymentSuccessAPIView.as_view(), name="payment_success"),
    path("course/search/", api_views.SearchCourseAPIView.as_view(), name="search_course"),
]
