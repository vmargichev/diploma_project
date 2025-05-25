from django.contrib import admin
from .models import (
    Category, Country, Coupon, CartOrder, Course, Certificate,
    CartOrderItem, Cart, Note, Question_Answer, Question_Answer_Message,
    Review, Teacher, Notification, EnrolledCourse, Variant, VariantItem,
    CompletedLesson, Wishlist
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    pass

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    pass

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    pass

@admin.register(CartOrder)
class CartOrderAdmin(admin.ModelAdmin):
    pass

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    pass

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    pass

@admin.register(CartOrderItem)
class CartOrderItemAdmin(admin.ModelAdmin):
    pass

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    pass

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    pass

@admin.register(Question_Answer)
class QuestionAnswerAdmin(admin.ModelAdmin):
    pass

@admin.register(Question_Answer_Message)
class QuestionAnswerMessageAdmin(admin.ModelAdmin):
    pass

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    pass

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    pass

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    pass

@admin.register(EnrolledCourse)
class EnrolledCourseAdmin(admin.ModelAdmin):
    pass

@admin.register(Variant)
class VariantAdmin(admin.ModelAdmin):
    pass

@admin.register(VariantItem)
class VariantItemAdmin(admin.ModelAdmin):
    pass

@admin.register(CompletedLesson)
class CompletedLessonAdmin(admin.ModelAdmin):
    pass

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    pass

