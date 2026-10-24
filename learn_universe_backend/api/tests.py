from decimal import Decimal
from uuid import uuid4

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Cart, Course, User, Country, Coupon, CartOrder, CartOrderItem, Teacher


class CartAPIViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass1234")
        self.teacher = Teacher.objects.create(user=self.user)
        self.course = Course.objects.create(title="Test Course", price=100.00, teacher=self.teacher)
        self.country = Country.objects.create(name="Bulgaria", tax_rate=20, active=True)
        self.cart_id = uuid4().hex[:20]

        self.cart = Cart.objects.create(
            cart_id=self.cart_id,
            course=self.course,
            user=self.user,
            price=self.course.price,
            tax_fee=Decimal("20.00"),
            total=Decimal("120.00"),
            country=self.country
        )

        self.order = CartOrder.objects.create(
            full_name="Tester",
            email="tester@example.com",
            country=self.country.name,
            student=self.user,
        )
        CartOrderItem.objects.create(
            order=self.order,
            course=self.course,
            teacher=self.course.teacher,
            price=Decimal("100.00"),
            tax_fee=Decimal("20.00"),
            total=Decimal("120.00"),
            initial_total=Decimal("120.00"),
            teacher_id=self.teacher.id
        )
        self.coupon = Coupon.objects.create(code="SAVE20", discount=20, teacher=self.course.teacher)

    def test_duplicate_cart_item_is_rejected(self):
        url = reverse('cart_create')
        data = {
            "course": self.course.pk,
            "country": self.country.name,
            "user": self.user.pk,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(Cart.objects.filter(user=self.user, course=self.course).exists())

    def test_list_cart_success(self):
        url = reverse("cart_list", kwargs={"cart_id": self.cart_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["course"]["id"], self.course.id)
        self.assertEqual(response.data[0]["user"], self.user.id)

    def test_cart_item_delete_success(self):
        url = reverse("cart_item_delete", kwargs={"cart_id": self.cart.cart_id, "course": self.course.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Cart.objects.filter(cart_id=self.cart.cart_id, course=self.course).exists())

    def test_cart_stats_success(self):
        url = reverse("cart_stats", kwargs={"cart_id": self.cart_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_price"], float(self.cart.price))
        self.assertEqual(response.data["total_tax"], float(self.cart.tax_fee))
        self.assertEqual(response.data["total_total"], float(self.cart.total))

    def test_create_order_success(self):
        url = reverse("order_create")
        data = {
            "full_name": "Test User",
            "email": "test@example.com",
            "country": self.country.name,
            "cart_id": self.cart_id,
            "user_id": self.user.id,
        }
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Order created successfully.")

    def test_order_checkout_success(self):
        url = reverse("order_checkout", kwargs={"oid": self.order.oid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["oid"], self.order.oid)

    def test_apply_coupon_success(self):
        url = reverse("coupon_apply")
        data = {
            "coupon_code": self.coupon.code,
            "oid": self.order.oid
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
