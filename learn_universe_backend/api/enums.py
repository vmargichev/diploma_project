from django.db import models

class Language(models.TextChoices):
    ENGLISH = "English", "English"
    SPANISH = "Spanish", "Spanish"
    FRENCH = "French", "French"
    BULGARIAN = "Bulgarian", "Bulgarian"

class Level(models.TextChoices):
    BEGINNER = "Beginner", "Beginner"
    INTERMEDIATE = "Intermediate", "Intermediate"
    ADVANCED = "Advanced", "Advanced"

class TeacherStatus(models.TextChoices):
    DRAFT = "Draft", "Draft"
    DISABLED = "Disabled", "Disabled"
    PUBLISHED = "Published", "Published"

class PaymentStatus(models.TextChoices):
    PAID = "Paid", "Paid"
    PROCESSING = "Processing", "Processing"
    FAILED = "Failed", "Failed"

class PlatformStatus(models.TextChoices):
    REVIEW = "Review", "Review"
    DISABLED = "Disabled", "Disabled"
    REJECTED = "Rejected", "Rejected"
    DRAFT = "Draft", "Draft"
    PUBLISHED = "Published", "Published"

class Rating(models.IntegerChoices):
    ONE_STAR = 1, "★☆☆☆☆"
    TWO_STAR = 2, "★★☆☆☆"
    THREE_STAR = 3, "★★★☆☆"
    FOUR_STAR = 4, "★★★★☆"
    FIVE_STAR = 5, "★★★★★"

class NotificationType(models.TextChoices):
    NEW_ORDER = "New Order", "New Order"
    NEW_REVIEW = "New Review", "New Review"
    NEW_COURSE_QUESTION = "New Course Question", "New Course Question"
    DRAFT = "Draft", "Draft"
    COURSE_PUBLISHED = "Course Published", "Course Published"
    COURSE_ENROLLMENT_COMPLETED = "Course Enrollment Completed", "Course Enrollment Completed"
