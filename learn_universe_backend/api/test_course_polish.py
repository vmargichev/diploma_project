from types import SimpleNamespace
from unittest.mock import patch

from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase

from api.models import Category, Course, CartOrder
from userauths.models import User


class RelatedCourseTests(APITestCase):
    def test_only_published_same_category_courses_are_returned(self):
        category = Category.objects.create(title='Programming')
        current = Course.objects.create(title='Current', category=category)
        siblings = [Course.objects.create(title=f'Related {i}', category=category) for i in range(5)]
        Course.objects.create(title='Other category')
        Course.objects.create(title='Hidden', category=category, platform_status='Draft')
        Course.objects.create(title='Teacher draft', category=category, teacher_course_status='Draft')
        response = self.client.get(f'/api/v1/course/course-detail/{current.slug}/related/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([c['id'] for c in response.data], [c.pk for c in reversed(siblings[1:])])
        self.assertNotIn('students', response.data[0])

    def test_uncategorized_course_has_no_related_courses(self):
        course = Course.objects.create(title='Uncategorized')
        response = self.client.get(f'/api/v1/course/course-detail/{course.slug}/related/')
        self.assertEqual(response.data, [])

    def test_missing_course_is_404(self):
        self.assertEqual(self.client.get('/api/v1/course/course-detail/missing/related/').status_code, 404)


class IntegrationConfigurationTests(APITestCase):
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
                       FRONTEND_SITE_URL='https://learning.example/')
    def test_password_reset_uses_configured_frontend_without_sending_email(self):
        user = User.objects.create_user(username='reset', email='reset@example.test', password='Test123!')
        response = self.client.post(f'/api/v1/user/reset-pass/{user.email}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('https://learning.example/create-new-pass/?', mail.outbox[0].body)
        self.assertNotIn('localhost', mail.outbox[0].body)

    @override_settings(FRONTEND_SITE_URL='https://learning.example')
    @patch('api.views.stripe.checkout.Session.create')
    def test_stripe_urls_and_session_persistence_without_payment(self, create_session):
        order = CartOrder.objects.create(full_name='Test', email='test@example.test', total=12)
        create_session.return_value = SimpleNamespace(id='cs_test_local', url='https://checkout.stripe.com/test')
        response = self.client.post(f'/api/v1/payment/stripe-checkout/{order.oid}/')
        self.assertEqual(response.status_code, 302)
        kwargs = create_session.call_args.kwargs
        self.assertEqual(kwargs['success_url'], f'https://learning.example/payment-success/{order.oid}?session_id={{CHECKOUT_SESSION_ID}}')
        self.assertEqual(kwargs['cancel_url'], 'https://learning.example/cart/')
        order.refresh_from_db()
        self.assertEqual(order.stripe_session_id, 'cs_test_local')
