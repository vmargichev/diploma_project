from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from api.models import Course, Teacher, Variant, VariantItem, CartOrder, CartOrderItem, EnrolledCourse
from userauths.models import User


class LearningBaselineTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='student', email='student@example.test', password='Test-pass-123')
        self.instructor = User.objects.create_user(username='instructor', email='instructor@example.test', password='Test-pass-123', is_teacher=True)
        self.teacher = Teacher.objects.create(user=self.instructor)
        self.course = Course.objects.create(title='Python basics', teacher=self.teacher)
        variant = Variant.objects.create(course=self.course, title='Variables')
        VariantItem.objects.create(variant=variant, title='First lesson')
        order = CartOrder.objects.create(student=self.student)
        item = CartOrderItem.objects.create(order=order, course=self.course, teacher=self.teacher)
        self.enrollment = EnrolledCourse.objects.create(course=self.course, user=self.student, teacher=self.teacher, order_item=item)

    def test_login_and_refresh_for_both_roles(self):
        for user in (self.student, self.instructor):
            response = self.client.post('/api/v1/user/token', {'email': user.email, 'password': 'Test-pass-123'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(AccessToken(response.data['access'])['is_teacher'], user.is_teacher)
            refreshed = self.client.post('/api/v1/user/token/refresh/', {'refresh': response.data['refresh']})
            self.assertEqual(refreshed.status_code, 200)
            self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + refreshed.data['access'])
            self.assertEqual(self.client.get('/api/v1/course/course-list').status_code, 200)
            self.client.credentials()

    def test_invalid_login_is_rejected(self):
        response = self.client.post('/api/v1/user/token', {'email': self.student.email, 'password': 'wrong'})
        self.assertEqual(response.status_code, 401)

    def test_catalogue_is_public(self):
        response = self.client.get('/api/v1/course/course-list')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['title'], self.course.title)

    def test_student_can_read_own_enrollment_and_curriculum(self):
        self.client.force_authenticate(self.student)
        response = self.client.get(f'/api/v1/student/course-detail/{self.student.pk}/{self.enrollment.enrollment_id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['curriculum'][0]['title'], 'Variables')

    def test_student_routes_require_login_and_ownership(self):
        paths = [f'/api/v1/student/summary/{self.student.pk}/',
                 f'/api/v1/student/course-list/{self.student.pk}/',
                 f'/api/v1/student/course-detail/{self.student.pk}/{self.enrollment.enrollment_id}/']
        for path in paths:
            self.client.force_authenticate(None)
            self.assertEqual(self.client.get(path).status_code, 401)
            self.client.force_authenticate(self.instructor)
            self.assertEqual(self.client.get(path).status_code, 403)

    def test_teacher_course_list_uses_user_id(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.get(f'/api/v1/teacher/course-lists/{self.instructor.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([course['id'] for course in response.data], [self.course.pk])
        self.assertEqual(self.client.get(f'/api/v1/teacher/course-lists/{self.student.pk}/').status_code, 403)

    def test_student_cannot_create_courses(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/v1/teacher/course-create/', {'title': 'Not allowed'})
        self.assertEqual(response.status_code, 403)

    def test_teacher_creates_course_under_own_identity(self):
        other_user = User.objects.create_user(username='other', email='other@example.test', is_teacher=True)
        other_teacher = Teacher.objects.create(user=other_user)
        self.client.force_authenticate(self.instructor)
        response = self.client.post('/api/v1/teacher/course-create/', {'title': 'New lesson', 'teacher': other_teacher.pk})
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(Course.objects.get(title='New lesson').teacher, self.teacher)
