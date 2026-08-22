from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    Teacher, Category, Course, Variant, VariantItem,
    CartOrder, CartOrderItem, EnrolledCourse, Review,
    Note, Wishlist, Coupon, Country, Question_Answer,
    Question_Answer_Message, CompletedLesson, Notification,
)
from api.enums import (
    Language, Level, PlatformStatus, TeacherStatus,
    PaymentStatus, Rating, NotificationType,
)
from userauths.models import Profile

User = get_user_model()


COURSES = [
    {
        "title": "Complete Python Bootcamp: From Zero to Hero",
        "description": "Learn Python programming from scratch. Covers variables, data structures, OOP, file I/O, and real-world projects.",
        "price": Decimal("49.99"),
        "language": Language.ENGLISH,
        "level": Level.BEGINNER,
        "category": "Programming",
        "teacher_idx": 0,
        "variants": [
            {
                "title": "Getting Started with Python",
                "items": ["Installing Python & VS Code", "Variables and Data Types", "Control Flow: if/else and loops", "Functions and Scope"],
            },
            {
                "title": "Object-Oriented Programming",
                "items": ["Classes and Objects", "Inheritance and Polymorphism", "Magic Methods", "Building a Real Project"],
            },
            {
                "title": "Working with Files and APIs",
                "items": ["Reading and Writing Files", "JSON and CSV", "Making HTTP Requests", "Final Capstone Project"],
            },
        ],
    },
    {
        "title": "Django REST Framework: Build Production APIs",
        "description": "Master DRF to build secure, scalable REST APIs. Covers serializers, viewsets, authentication, and deployment.",
        "price": Decimal("69.99"),
        "language": Language.ENGLISH,
        "level": Level.INTERMEDIATE,
        "category": "Web Development",
        "teacher_idx": 0,
        "variants": [
            {
                "title": "DRF Foundations",
                "items": ["Project Setup and Models", "Serializers Deep Dive", "APIView vs ViewSet", "Routers and URLs"],
            },
            {
                "title": "Authentication and Permissions",
                "items": ["JWT Authentication", "Permission Classes", "Throttling and Rate Limiting", "Custom Permissions"],
            },
            {
                "title": "Advanced Topics",
                "items": ["Filtering and Search", "Pagination Strategies", "File Uploads", "Deployment to VPS"],
            },
        ],
    },
    {
        "title": "React 18 Complete Guide with Hooks",
        "description": "Build modern React applications using hooks, context, React Router, and state management with Zustand.",
        "price": Decimal("59.99"),
        "language": Language.ENGLISH,
        "level": Level.INTERMEDIATE,
        "category": "Web Development",
        "teacher_idx": 1,
        "variants": [
            {
                "title": "React Fundamentals",
                "items": ["JSX and Components", "Props and State", "Event Handling", "Lists and Keys"],
            },
            {
                "title": "Hooks in Depth",
                "items": ["useState and useEffect", "useContext and useRef", "useMemo and useCallback", "Custom Hooks"],
            },
            {
                "title": "Building a Full App",
                "items": ["React Router v6", "State Management with Zustand", "Axios and API Integration", "Deploying to Netlify"],
            },
        ],
    },
    {
        "title": "Machine Learning A-Z with Python & Scikit-Learn",
        "description": "Hands-on machine learning course covering regression, classification, clustering, and neural networks.",
        "price": Decimal("79.99"),
        "language": Language.ENGLISH,
        "level": Level.INTERMEDIATE,
        "category": "Data Science",
        "teacher_idx": 1,
        "variants": [
            {
                "title": "Supervised Learning",
                "items": ["Linear Regression", "Logistic Regression", "Decision Trees", "Random Forests and Ensemble Methods"],
            },
            {
                "title": "Unsupervised Learning",
                "items": ["K-Means Clustering", "Hierarchical Clustering", "PCA Dimensionality Reduction", "Association Rule Learning"],
            },
            {
                "title": "Neural Networks",
                "items": ["Intro to Deep Learning", "Building ANNs with Keras", "Convolutional Networks", "Recurrent Networks"],
            },
        ],
    },
    {
        "title": "Ethical Hacking & Penetration Testing",
        "description": "Learn offensive security techniques legally. Covers network scanning, exploitation, privilege escalation, and reporting.",
        "price": Decimal("89.99"),
        "language": Language.ENGLISH,
        "level": Level.ADVANCED,
        "category": "Cybersecurity",
        "teacher_idx": 2,
        "variants": [
            {
                "title": "Reconnaissance and Scanning",
                "items": ["Kali Linux Setup", "Nmap Network Scanning", "Vulnerability Scanning with OpenVAS", "OSINT Techniques"],
            },
            {
                "title": "Exploitation",
                "items": ["Metasploit Framework", "Exploiting Web Vulnerabilities", "SQL Injection in Practice", "XSS and CSRF Attacks"],
            },
            {
                "title": "Post-Exploitation and Reporting",
                "items": ["Privilege Escalation", "Lateral Movement", "Covering Tracks", "Writing Professional Pentest Reports"],
            },
        ],
    },
    {
        "title": "iOS Development with Swift 5 and SwiftUI",
        "description": "Build beautiful iOS apps from scratch using Swift and SwiftUI. Covers layouts, navigation, networking, and App Store submission.",
        "price": Decimal("74.99"),
        "language": Language.ENGLISH,
        "level": Level.BEGINNER,
        "category": "Mobile Development",
        "teacher_idx": 2,
        "variants": [
            {
                "title": "Swift Language Essentials",
                "items": ["Variables, Constants, and Types", "Optionals and Error Handling", "Structs, Classes, and Protocols", "Closures and Generics"],
            },
            {
                "title": "SwiftUI Layouts",
                "items": ["Views and Modifiers", "Stacks, Grids, and Lists", "Navigation and Sheets", "Animations and Transitions"],
            },
            {
                "title": "Networking and Data",
                "items": ["URLSession and Async/Await", "Decoding JSON with Codable", "Persisting Data with Core Data", "App Store Submission"],
            },
        ],
    },
    {
        "title": "Digital Marketing Masterclass",
        "description": "Full-stack digital marketing course covering SEO, social media, email marketing, paid ads, and analytics.",
        "price": Decimal("44.99"),
        "language": Language.ENGLISH,
        "level": Level.BEGINNER,
        "category": "Digital Marketing",
        "teacher_idx": 0,
        "variants": [
            {
                "title": "SEO and Content Marketing",
                "items": ["Keyword Research with Ahrefs", "On-Page SEO Techniques", "Link Building Strategies", "Content That Converts"],
            },
            {
                "title": "Paid Advertising",
                "items": ["Google Ads Fundamentals", "Facebook & Instagram Ads", "Retargeting Campaigns", "Measuring ROAS"],
            },
        ],
    },
    {
        "title": "SQL for Data Analysis: From Beginner to Advanced",
        "description": "Master SQL for data analysis. Covers SELECT, JOINs, aggregations, window functions, and query optimization.",
        "price": Decimal("39.99"),
        "language": Language.ENGLISH,
        "level": Level.BEGINNER,
        "category": "Data Science",
        "teacher_idx": 1,
        "variants": [
            {
                "title": "SQL Basics",
                "items": ["SELECT and Filtering", "Sorting and Limiting Results", "Aggregate Functions", "GROUP BY and HAVING"],
            },
            {
                "title": "Advanced SQL",
                "items": ["INNER, LEFT, and FULL JOINs", "Subqueries and CTEs", "Window Functions", "Query Optimization and Indexes"],
            },
        ],
    },
    {
        "title": "Flutter Cross-Platform App Development",
        "description": "Build iOS and Android apps from a single codebase using Flutter and Dart. Covers widgets, state, Firebase, and publishing.",
        "price": Decimal("64.99"),
        "language": Language.ENGLISH,
        "level": Level.INTERMEDIATE,
        "category": "Mobile Development",
        "teacher_idx": 2,
        "variants": [
            {
                "title": "Dart and Flutter Basics",
                "items": ["Dart Language Fundamentals", "Flutter Widget Tree", "Stateless vs Stateful Widgets", "Layout and Styling"],
            },
            {
                "title": "State Management and Firebase",
                "items": ["Provider and Riverpod", "Firebase Auth", "Firestore Database", "Push Notifications"],
            },
        ],
    },
    {
        "title": "Основи на Програмирането с Python",
        "description": "Научете основите на програмирането с Python. Курсът е на Български и е подходящ за абсолютни начинаещи.",
        "price": Decimal("29.99"),
        "language": Language.BULGARIAN,
        "level": Level.BEGINNER,
        "category": "Programming",
        "teacher_idx": 0,
        "variants": [
            {
                "title": "Въведение в Python",
                "items": ["Инсталация и настройка", "Променливи и типове данни", "Условни оператори и цикли", "Функции"],
            },
            {
                "title": "Проекти",
                "items": ["Калкулатор", "Игра на отгатване на число", "Работа с файлове", "Финален проект"],
            },
        ],
    },
    {
        "title": "Docker & Kubernetes: The Complete DevOps Guide",
        "description": "Learn containerisation and orchestration with Docker and Kubernetes. Covers images, networking, Helm, and CI/CD pipelines.",
        "price": Decimal("84.99"),
        "language": Language.ENGLISH,
        "level": Level.ADVANCED,
        "category": "Web Development",
        "teacher_idx": 1,
        "variants": [
            {
                "title": "Docker Fundamentals",
                "items": ["Images and Containers", "Dockerfiles and Layers", "Docker Compose", "Networking and Volumes"],
            },
            {
                "title": "Kubernetes in Production",
                "items": ["Pods, Deployments, and Services", "ConfigMaps and Secrets", "Helm Charts", "CI/CD with GitHub Actions"],
            },
        ],
    },
    {
        "title": "Data Visualization with Power BI",
        "description": "Create stunning dashboards and reports with Power BI. Covers data modelling, DAX formulas, and publishing.",
        "price": Decimal("54.99"),
        "language": Language.ENGLISH,
        "level": Level.BEGINNER,
        "category": "Data Science",
        "teacher_idx": 2,
        "variants": [
            {
                "title": "Getting Started with Power BI",
                "items": ["Connecting Data Sources", "Building Your First Dashboard", "Filters and Slicers", "Publishing to Power BI Service"],
            },
            {
                "title": "DAX and Advanced Modeling",
                "items": ["Calculated Columns vs Measures", "Time Intelligence Functions", "Row-Level Security", "Performance Optimization"],
            },
        ],
    },
]

REVIEWS_BY_COURSE = {
    0: [
        (4, "Great course! The explanations are clear and the projects are practical."),
        (5, "Best Python course I've found. Highly recommended for beginners."),
        (3, "Good content but some sections felt rushed. Overall worth it."),
    ],
    1: [
        (5, "Excellent DRF content. I built my first API after watching just two sections."),
        (4, "Very detailed and well structured. The JWT auth section saved me hours."),
    ],
    2: [
        (5, "React 18 with hooks explained better than any YouTube video. Worth every penny."),
        (4, "The Zustand section alone is worth the price. Great course."),
        (3, "Some parts need updating but overall solid material."),
    ],
    3: [
        (5, "This ML course is phenomenal. Real datasets, real projects."),
        (4, "The neural network section could go deeper but everything else is top notch."),
    ],
    4: [
        (5, "Hands-on and practical. Learned more here than in any book."),
        (4, "Great pentest course. Lab setup instructions were very clear."),
    ],
    5: [
        (4, "Swift and SwiftUI explained really well. App Store section was a bonus."),
        (5, "Published my first app after completing this course. Amazing."),
    ],
    6: [
        (4, "Good marketing overview. SEO section is especially useful."),
        (3, "Needs more depth on analytics but decent for beginners."),
    ],
    7: [
        (5, "Best SQL course. Window functions explained step by step."),
        (4, "Thorough and practical. The optimization section alone is worth it."),
    ],
    8: [
        (4, "Flutter course is up to date. Firebase integration worked first try."),
        (5, "Saved me from learning iOS and Android separately. Excellent."),
    ],
    9: [
        (5, "Страхотен курс! Препоръчвам на всеки, който иска да учи програмиране."),
        (4, "Много добре обяснено. Проектите са интересни и полезни."),
    ],
    10: [
        (5, "The Kubernetes section is production-ready knowledge. Outstanding."),
        (4, "Docker Compose section alone saved my whole team hours of debugging."),
    ],
    11: [
        (4, "Power BI course is well structured. DAX section is gold."),
        (5, "I built three client dashboards after finishing this. Highly recommended."),
    ],
}


class Command(BaseCommand):
    help = "Seed the database with realistic demo data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        self._create_countries()
        teachers, teacher_users = self._create_teachers()
        students = self._create_students()
        categories = self._create_categories()
        courses = self._create_courses(teachers, categories)
        self._create_enrollments(students, courses, teachers)
        self._create_wishlists(students, courses)
        self._create_coupons(teachers)
        self._create_qa(students, courses)

        self.stdout.write(self.style.SUCCESS("Done! DB seeded successfully."))
        self.stdout.write("")
        self.stdout.write("Teacher accounts (password: teacher123):")
        for u in teacher_users:
            self.stdout.write(f"  {u.email}")
        self.stdout.write("Student accounts (password: student123):")
        for s in students:
            self.stdout.write(f"  {s.email}")

    # ------------------------------------------------------------------

    def _create_countries(self):
        data = [
            ("United States", 8),
            ("Bulgaria", 20),
            ("United Kingdom", 20),
            ("Germany", 19),
            ("France", 20),
            ("Canada", 13),
            ("Australia", 10),
        ]
        for name, tax in data:
            Country.objects.get_or_create(name=name, defaults={"tax_rate": tax})
        self.stdout.write(f"  Created {len(data)} countries")

    def _create_teachers(self):
        specs = [
            ("John Smith", "john.smith@learnuniverse.local", "Python & Django specialist with 8 years of industry experience.", "United States"),
            ("Sarah Johnson", "sarah.johnson@learnuniverse.local", "Data scientist and ML engineer. Former Google researcher.", "United Kingdom"),
            ("Mike Chen", "mike.chen@learnuniverse.local", "Full-stack developer and mobile app expert. 50+ apps shipped.", "Canada"),
        ]
        teachers, users = [], []
        for full_name, email, bio, country in specs:
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0].replace(".", "_"),
                    "full_name": full_name,
                    "is_teacher": True,
                },
            )
            user.set_password("teacher123")
            user.save()
            Profile.objects.get_or_create(user=user, defaults={"full_name": full_name, "country": country})
            teacher, _ = Teacher.objects.get_or_create(
                user=user,
                defaults={"full_name": full_name, "bio": bio, "country": country, "about": bio},
            )
            teachers.append(teacher)
            users.append(user)
        self.stdout.write(f"  Created {len(teachers)} teachers")
        return teachers, users

    def _create_students(self):
        specs = [
            ("Alice Brown", "alice.brown@learnuniverse.local", "Bulgaria"),
            ("Bob Wilson", "bob.wilson@learnuniverse.local", "United States"),
            ("Carol Davis", "carol.davis@learnuniverse.local", "Germany"),
            ("David Martinez", "david.martinez@learnuniverse.local", "France"),
            ("Emma Taylor", "emma.taylor@learnuniverse.local", "Australia"),
        ]
        students = []
        for full_name, email, country in specs:
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0].replace(".", "_"),
                    "full_name": full_name,
                },
            )
            user.set_password("student123")
            user.save()
            Profile.objects.get_or_create(user=user, defaults={"full_name": full_name, "country": country})
            students.append(user)
        self.stdout.write(f"  Created {len(students)} students")
        return students

    def _create_categories(self):
        names = ["Programming", "Web Development", "Data Science", "Cybersecurity", "Mobile Development", "Digital Marketing"]
        cats = {}
        for name in names:
            cat, _ = Category.objects.get_or_create(title=name)
            cats[name] = cat
        self.stdout.write(f"  Created {len(cats)} categories")
        return cats

    def _create_courses(self, teachers, categories):
        courses = []
        for i, cd in enumerate(COURSES):
            teacher = teachers[cd["teacher_idx"]]
            category = categories[cd["category"]]
            course, created = Course.objects.get_or_create(
                title=cd["title"],
                defaults={
                    "description": cd["description"],
                    "price": cd["price"],
                    "language": cd["language"],
                    "level": cd["level"],
                    "category": category,
                    "teacher": teacher,
                    "platform_status": PlatformStatus.PUBLISHED,
                    "teacher_course_status": TeacherStatus.PUBLISHED,
                    "featured": i < 4,
                },
            )
            if created:
                for vd in cd["variants"]:
                    variant = Variant.objects.create(course=course, title=vd["title"])
                    for j, item_title in enumerate(vd["items"]):
                        VariantItem.objects.create(
                            variant=variant,
                            title=item_title,
                            content_duration=f"{8 + j * 3}:00",
                            preview=(j == 0),
                        )
            courses.append(course)
        self.stdout.write(f"  Created {len(courses)} courses with variants and lessons")
        return courses

    def _create_enrollments(self, students, courses, teachers):
        # Each student enrolls in a different slice of courses
        enrollments_plan = [
            (students[0], [0, 1, 2, 9]),
            (students[1], [2, 3, 10]),
            (students[2], [4, 5, 6]),
            (students[3], [1, 7, 8, 11]),
            (students[4], [0, 3, 5, 9]),
        ]
        total_enrollments = 0
        for student, course_indices in enrollments_plan:
            country_obj = Country.objects.filter(name=student.profile.country if hasattr(student, 'profile') else "United States").first()
            tax_rate = Decimal(str(country_obj.tax_rate if country_obj else 10)) / 100

            order = CartOrder.objects.create(
                student=student,
                payment_status=PaymentStatus.PAID,
                full_name=student.full_name,
                email=student.email,
                country=country_obj.name if country_obj else "United States",
            )
            sub_total = Decimal("0")
            for ci in course_indices:
                course = courses[ci]
                teacher = course.teacher
                price = course.price
                tax = (price * tax_rate).quantize(Decimal("0.01"))
                total = price + tax

                order_item = CartOrderItem.objects.create(
                    order=order,
                    course=course,
                    teacher=teacher,
                    price=price,
                    tax_fee=tax,
                    total=total,
                    initial_total=total,
                )
                order.teachers.add(teacher)

                enrollment, _ = EnrolledCourse.objects.get_or_create(
                    course=course,
                    user=student,
                    defaults={"teacher": teacher, "order_item": order_item},
                )

                # Mark first 2 lessons as completed
                lessons = list(VariantItem.objects.filter(variant__course=course)[:2])
                for lesson in lessons:
                    CompletedLesson.objects.get_or_create(course=course, user=student, variant_item=lesson)

                # Add a note
                Note.objects.get_or_create(
                    course=course,
                    user=student,
                    defaults={"title": f"Notes on {course.title[:40]}", "note": "Key points to remember from this section."},
                )

                sub_total += price

            # Add reviews for some enrollments
            review_data = REVIEWS_BY_COURSE.get(ci, [])  # noqa: F821 — uses last ci
            for ri, (course_idx) in enumerate(course_indices):
                course = courses[course_idx]
                course_reviews = REVIEWS_BY_COURSE.get(course_idx, [])
                if ri < len(course_reviews):
                    rating, text = course_reviews[ri]
                    Review.objects.get_or_create(
                        course=course,
                        user=student,
                        defaults={"review": text, "rating": rating, "active": True},
                    )

            tax_total = (sub_total * tax_rate).quantize(Decimal("0.01"))
            order.sub_total = sub_total
            order.tax_fee = tax_total
            order.total = sub_total + tax_total
            order.initial_total = sub_total + tax_total
            order.save()
            total_enrollments += len(course_indices)

        self.stdout.write(f"  Created {total_enrollments} enrollments, lessons, notes, and reviews")

    def _create_wishlists(self, students, courses):
        wishlist_plan = [
            (students[0], [3, 4, 10]),
            (students[1], [0, 6, 11]),
            (students[2], [2, 8]),
            (students[3], [0, 5]),
            (students[4], [7, 11]),
        ]
        for student, idxs in wishlist_plan:
            for i in idxs:
                Wishlist.objects.get_or_create(user=student, course=courses[i])
        self.stdout.write("  Created wishlists")

    def _create_coupons(self, teachers):
        codes = [("SAVE20", 20), ("PYTHON15", 15), ("MOBILE10", 10)]
        for teacher, (code, discount) in zip(teachers, codes):
            Coupon.objects.get_or_create(
                teacher=teacher,
                code=code,
                defaults={"discount": discount, "active": True},
            )
        self.stdout.write("  Created coupons")

    def _create_qa(self, students, courses):
        threads = [
            (courses[0], students[0], "How do I install Python on Windows?",
             [(students[1], "Just go to python.org, download the installer, and make sure to check 'Add to PATH'!"),
              (students[0], "Thanks! That worked perfectly.")]),
            (courses[1], students[3], "What is the difference between APIView and ViewSet?",
             [(students[1], "APIView gives you full control per HTTP method. ViewSet groups CRUD logic automatically with a router."),
              (students[3], "Got it, that makes sense now. Thanks!")]),
            (courses[2], students[2], "When should I use useCallback?",
             [(students[4], "Use it when you pass a function as a prop to a memoised child to prevent unnecessary re-renders."),
              (students[2], "Perfect explanation, thank you!")]),
        ]
        for course, asker, title, replies in threads:
            qa, _ = Question_Answer.objects.get_or_create(
                course=course, user=asker, title=title
            )
            Question_Answer_Message.objects.get_or_create(
                course=course, question=qa, user=asker,
                defaults={"message": title}
            )
            for replier, msg in replies:
                Question_Answer_Message.objects.get_or_create(
                    course=course, question=qa, user=replier,
                    defaults={"message": msg}
                )
        self.stdout.write("  Created Q&A threads")
