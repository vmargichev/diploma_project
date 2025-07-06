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
    path("user/get-user/<user_id>/", api_views.UserProfileView.as_view(), name="get_user"),

    # Core - Course
    path("course/category", api_views.CategoryListAPIView.as_view(), name="category_list"),
    path("course/course-list", api_views.CourseListAPIView.as_view(), name="course_list"),
    path("course/course-detail/<slug>/", api_views.CourseDetailAPIView.as_view(), name="course_detail"),


    # Cart
    path("course/cart", api_views.CartAPIView.as_view(), name="cart_create"),
    path("course/cart-list/<cart_id>/", api_views.CartListAPIView.as_view(), name="cart_list"),
    path("course/cart-item-delete/<cart_id>/<course>/", api_views.CartItemDeleteAPIView.as_view(), name="cart_item_delete"),
    path("cart/stats/<cart_id>/", api_views.CartStatsAPIView.as_view(), name="cart_stats"),
    path("cart/clear-cart/<cart_id>/", api_views.ClearCartAPIView.as_view(), name="cart_delete"),


    # Order
    path("order/create-order/", api_views.CartOrderCreateAPIView.as_view(), name="order_create"),
    path("order/checkout/<oid>/", api_views.OrderCheckoutAPIView.as_view(), name="order_checkout"),
    path("order/coupon/", api_views.CouponApplyAPIView.as_view(), name="coupon_apply"),
    path("payment/stripe-checkout/<order_id>/", api_views.StripeCheckoutAPIView.as_view(), name="stripe_checkout"),
    path("payment/payment-success/<order_id>/", api_views.PaymentSuccessAPIView.as_view(), name="payment_success"),
    path("course/search/", api_views.SearchCourseAPIView.as_view(), name="search_course"),

# Student API Endpoints
    path("student/summary/<user_id>/", api_views.StudentSummaryAPIView.as_view()),
    path("student/course-list/<user_id>/", api_views.StudentCourseListAPIView.as_view()),
    path("student/course-detail/<user_id>/<enrollment_id>/", api_views.StudentCourseDetailAPIView.as_view()),
    path("student/course-completed/", api_views.StudentCourseCompletedCreateAPIView.as_view()),
    path("student/course-note/<user_id>/<enrollment_id>/", api_views.StudentNoteCreateAPIView.as_view()),
    path("student/course-note-detail/<user_id>/<enrollment_id>/<note_id>/", api_views.StudentNoteDetailAPIView.as_view()),
    path("student/rate-course/", api_views.StudentRateCourseCreateAPIView.as_view()),
    path("student/review-detail/<user_id>/<review_id>/", api_views.StudentRateCourseUpdateAPIView.as_view()),
    path("student/wishlist/<user_id>/", api_views.StudentWishListListCreateAPIView.as_view()),
    path("student/question-answer-list-create/<course_id>/", api_views.QuestionAnswerListCreateAPIView.as_view()),
    path("student/question-answer-message-create/", api_views.QuestionAnswerMessageSendAPIView.as_view()),

    # Teacher Routes
    path("teacher/summary/<teacher_id>/", api_views.TeacherSummaryAPIView.as_view()),
    path("teacher/course-lists/<teacher_id>/", api_views.TeacherCourseListAPIView.as_view()),
    path("teacher/review-lists/<teacher_id>/", api_views.TeacherReviewListAPIView.as_view()),
    path("teacher/review-detail/<teacher_id>/<review_id>/", api_views.TeacherReviewDetailAPIView.as_view()),
    path("teacher/student-lists/<teacher_id>/", api_views.TeacherStudentsListAPIVIew.as_view({'get': 'list'})),
    path("teacher/all-months-earning/<teacher_id>/", api_views.TeacherAllMonthEarningAPIView),
    path("teacher/best-course-earning/<teacher_id>/", api_views.TeacherBestSellingCourseAPIView.as_view({'get': 'list'})),
    path("teacher/course-order-list/<teacher_id>/", api_views.TeacherCourseOrdersListAPIView.as_view()),
    path("teacher/question-answer-list/<teacher_id>/", api_views.TeacherQuestionAnswerListAPIView.as_view()),
    path("teacher/coupon-list/<teacher_id>/", api_views.TeacherCouponListCreateAPIView.as_view()),
    path("teacher/coupon-detail/<teacher_id>/<coupon_id>/", api_views.TeacherCouponDetailAPIView.as_view()),
    path("teacher/noti-list/<teacher_id>/", api_views.TeacherNotificationListAPIView.as_view()),
    path("teacher/noti-detail/<teacher_id>/<noti_id>", api_views.TeacherNotificationDetailAPIView.as_view()),
    path("teacher/course-create/", api_views.CourseCreateAPIView.as_view()),
    path("teacher/course-delete/<id>/", api_views.CourseDeleteAPIView.as_view()),
    path("teacher/course-update/<teacher_id>/<course_id>/", api_views.CourseUpdateAPIView.as_view()),
    path("teacher/course-detail/<id>/", api_views.TeacherCourseDetailAPIView.as_view()),
    path("teacher/course/variant-delete/<variant_id>/<teacher_id>/<course_id>/", api_views.CourseVariantDeleteAPIView.as_view()),
    path("teacher/course/variant-item-delete/<variant_id>/<variant_item_id>/<teacher_id>/<course_id>/", api_views.VariantItemDestroyAPIView.as_view()),

    # path("file-upload/", api_views.FileUploadAPIView.as_view())
]
