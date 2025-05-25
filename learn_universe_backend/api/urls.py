from api import views as api_views
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("user/token", api_views.MyTokenObtainPairView.as_view()),
    path("user/token/refresh/", TokenRefreshView.as_view()),
    path("user/register/", api_views.RegisterView.as_view()),
    path("user/reset-pass/<email>/", api_views.PasswordResetEmailVerifyAPIView.as_view()),
    path("user/change-pass/", api_views.PasswordChangeAPIView.as_view()),


    #Core
    path("course/category", api_views.CategoryListAPIView.as_view()),
    path("course/course-list", api_views.CourseListAPIView.as_view()),
    path("course/course-detail/<slug>", api_views.CourseDetailAPIView.as_view()),
    path("course/cart", api_views.CartAPIView.as_view()),

]
