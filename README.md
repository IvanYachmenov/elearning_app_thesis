# E-Learning Platform

A full-stack web application for online education that allows students to enroll in courses, study structured theory content, and practice with both timed and untimed quizzes. The platform includes a teacher's cabinet where instructors can create, edit, and manage their courses. Built with Django REST Framework on the backend and React with Vite on the frontend.

### For Students

## Overview

This application provides a complete learning management system where students can browse available courses, enroll in them, study theoretical materials, and test their knowledge through practice quizzes. Teachers have dedicated tools to create and manage courses, modules, and topics. The platform supports both timed and untimed test modes, tracks student progress, and maintains a history of all attempts.

The system features a responsive design that works on desktop and mobile devices, includes dark theme support, and allows users to customize their profiles with background gradients and avatars.

## Core Features

### For Students

- Public course catalog with search and filtering capabilities
- Course enrollment system with JWT authentication (cookies-based)
- Structured learning path: theory content followed by practice quizzes
- Two types of practice tests: timed and untimed
- Progress tracking showing completion status and scores for each topic
- Test history with detailed view of all previous attempts
- Single-choice and multiple-choice question types
- Visual feedback for correct and incorrect answers
- Profile customization with avatar upload and background gradient selection
- Dark theme support with customizable settings
- Cookie consent banner for data privacy compliance
- Course cover images displayed in course listings
- Navigation lock notification during timed tests

### For Teachers

- Dedicated teacher's cabinet accessible via role-based permissions
- Create, edit, and delete courses
- Upload course cover images
- Manage modules and topics within courses (with collapsible sections)
- Set up theory content for each topic
- Configure practice questions with single or multiple correct answers
- Enable timed tests with configurable time limits
- View all courses created by the teacher
- Automatic slug generation for courses
- Full CRUD operations via REST API

## Technology Stack

### Backend

- Django 5.2.8 - Web framework
- Django REST Framework - API development
- Django REST Framework Simple JWT - Authentication
- django-cors-headers - CORS handling
- django-filter - API filtering
- PostgreSQL - Database
- Pillow - Image processing for avatars and course images
- psycopg2-binary - PostgreSQL adapter

### Frontend

- React 19 - UI library
- Vite - Build tool and development server
- React Router - Client-side routing
- Redux Toolkit - State management (if applicable)
- Axios - HTTP client for API calls
- CSS3 - Styling with custom themes

### Development Tools

- ESLint - Code linting
- Django Admin - Content management interface
- Hot Module Replacement - Fast development experience

## Installation and Setup

### Prerequisites

- Python 3.11 or higher
- Node.js 20 or higher
- PostgreSQL database server (running locally or accessible remotely)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     .\.venv\Scripts\activate
     ```
   - On Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```

4. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
   Or install manually:
   ```bash
   pip install "Django==5.2.8" djangorestframework djangorestframework-simplejwt django-cors-headers django-filter psycopg2-binary Pillow
   ```

5. Configure PostgreSQL database:
   
   Open PostgreSQL command line as a superuser (e.g., `psql -U postgres`) and run:
   ```sql
   CREATE DATABASE elearning;
   CREATE USER elearn_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE elearning TO elearn_user;
   ALTER ROLE elearn_user SET client_encoding TO 'UTF8';
   ALTER ROLE elearn_user SET timezone TO 'Europe/Bratislava';
   \q
   ```

   Alternatively, you can update the database settings in `backend/elearn_backend/settings.py` to match your existing PostgreSQL configuration.

6. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. Create a superuser account:
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to create an admin account.

8. Start the development server:
   ```bash
   python manage.py runserver
   ```
   The API will be available at http://127.0.0.1:8000/

   Note: Make sure to configure `CORS_ALLOWED_ORIGINS` in `settings.py` to include your frontend URL (typically http://localhost:5173 for Vite development server).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:5173/

   If your backend runs on a different host or port, update the API base URL in `frontend/src/shared/api/client.js` or set the `VITE_API_BASE_URL` environment variable.

## Using the Application

### Creating Courses

There are two ways to create courses:

#### Via Django Admin

1. Navigate to http://127.0.0.1:8000/admin/
2. Log in with your superuser credentials
3. In the admin interface, you can:
   - Create new Users (set their role to "teacher" if they should be able to create courses)
   - Create Courses with title and description
   - Add Modules to courses
   - Add Topics to modules with theory content
   - Create Topic Questions with options and mark correct answers
   - Set time limits for timed tests on topics

#### Via Teacher's Cabinet

1. Log in as a user with teacher role
2. Navigate to "My Courses" from the navigation menu
3. Click "Create New Course"
4. Fill in the course title and description
5. Add modules and topics directly from the interface
6. Save the course

![Teacher courses list](screenshots/teacher_courses_list.png)

![Course edit page](screenshots/course_edit_page1.png)

![Course edit with modules](screenshots/course_edit_page2.png)

### Student Workflow

1. **Browse Courses**: Visit the Courses page to see all available courses with search and filter options.

![Courses list](screenshots/courses_page1.png)

2. **View Course Details**: Click on any course to see its description, modules, topics, and enroll button. Course cover images are displayed prominently.

![Course detail](screenshots/courses_page2.png)

3. **Enroll in Course**: Click "Enroll" on a course detail page to add it to your learning dashboard.

4. **Take Practice Test**: Navigate to the Learning section, select a course, and click on any topic to start answering questions. You can choose between timed and untimed modes if the topic supports both.

![Learning page after enrollment](screenshots/learning_page1_after.png)

![Timed test option](screenshots/time_test_option.png)

6. **View Results**: After completing a test, see your score, pass/fail status, and detailed answer breakdown.

![Results page](screenshots/results_page.png)

7. **Review History**: Access your test history to review previous attempts and see which answers you selected.

![Test history](screenshots/test_history_page.png)

8. **Track Progress**: Monitor your learning progress with visual indicators showing which topics are completed, in progress, or failed.

![Learning progress](screenshots/learning_page2.png)

### Additional Features

- **Profile Customization**: Upload an avatar and choose from various background gradients for your profile page
- **Dark Theme**: Switch between light and dark themes in Settings
- **Language Selection**: Choose between English and Slovak
- **Mobile Responsive**: The application adapts to different screen sizes

![Mobile view](screenshots/mobile_devices.png)

![Login page](screenshots/login_page.png)

![Register page](screenshots/register_page.png)

![Profile page](screenshots/profile_page.png)

![Settings page](screenshots/settings_page.png)

## REST API Documentation

All API endpoints are prefixed with `/api/`. Authenticated endpoints require a JWT access token in the `Authorization: Bearer <token>` header.

### Authentication Endpoints

- `POST /api/auth/register/` - Register a new user
  - Request body: `username`, `email`, `password`, `first_name`, `last_name` (optional)
  - Returns: User data with tokens

- `POST /api/auth/token/` - Obtain JWT access and refresh tokens
  - Request body: `username` (or `email`), `password`
  - Returns: `access` and `refresh` tokens

- `POST /api/auth/token/refresh/` - Refresh the access token
  - Request body: `refresh` token
  - Returns: New `access` token

- `GET /api/auth/me/` - Get current user profile (authenticated)
  - Returns: User profile data including avatar URL and profile background

- `PATCH /api/auth/me/` - Update current user profile (authenticated)
  - Request body: `first_name`, `last_name`, `email`, `username`, `avatar` (file), `profile_background_gradient` (string)
  - Returns: Updated user profile

### Course Endpoints

- `GET /api/courses/` - Get public course list
  - Query parameters: `search`, `ordering`, `author_id`
  - Returns: List of courses with basic information

- `GET /api/courses/<id>/` - Get course details
  - Returns: Course data including modules and topics

- `POST /api/courses/<id>/enroll/` - Enroll authenticated user in course
  - Returns: Enrollment confirmation

- `GET /api/my-courses/` - Get courses enrolled by current user (authenticated)
  - Returns: List of enrolled courses

### Teacher Endpoints

All teacher endpoints require authentication and the `IsTeacher` permission.

- `GET /api/teacher/courses/` - List all courses created by the current teacher
  - Returns: List of courses with nested modules and topics

- `POST /api/teacher/courses/` - Create a new course
  - Request body: `title`, `description`, `image` (file, optional), `modules` (array with nested topics)
  - Content-Type: `multipart/form-data` (when image is included)
  - Returns: Created course data with `image_url`
  - Note: `author` is automatically set to the current user, `slug` is auto-generated

- `GET /api/teacher/courses/<id>/` - Get course details for editing
  - Returns: Course data with all nested modules and topics

- `PUT /api/teacher/courses/<id>/` - Update a course
  - Request body: `title`, `description`, `image` (file, optional), `modules` (array with nested topics)
  - Content-Type: `multipart/form-data` (when image is included)
  - Returns: Updated course data with `image_url`

- `PATCH /api/teacher/courses/<id>/` - Partially update a course
  - Request body: Any subset of course fields
  - Returns: Updated course data

- `DELETE /api/teacher/courses/<id>/` - Delete a course
  - Returns: 204 No Content

- `GET /api/teacher/modules/` - List modules for teacher's courses
- `POST /api/teacher/modules/` - Create a new module
- `GET /api/teacher/modules/<id>/` - Get module details
- `PUT /api/teacher/modules/<id>/` - Update a module
- `PATCH /api/teacher/modules/<id>/` - Partially update a module
- `DELETE /api/teacher/modules/<id>/` - Delete a module

- `GET /api/teacher/topics/` - List topics for teacher's courses
- `POST /api/teacher/topics/` - Create a new topic
- `GET /api/teacher/topics/<id>/` - Get topic details
- `PUT /api/teacher/topics/<id>/` - Update a topic
- `PATCH /api/teacher/topics/<id>/` - Partially update a topic
- `DELETE /api/teacher/topics/<id>/` - Delete a topic

### Learning and Practice Endpoints

All learning endpoints require authentication and enrollment in the related course.

- `GET /api/learning/courses/<id>/` - Get course content with progress tracking
  - Returns: Course data with per-topic progress, status, and scores

- `GET /api/learning/topics/<id>/` - Get topic theory and progress
  - Returns: Topic theory content and current progress status

- `GET /api/learning/topics/<id>/next-question/` - Get next practice question
  - Query parameters: For timed tests, includes `remaining_seconds` and timer status
  - Returns: Question data with options (correct answers not included for timed tests)

- `POST /api/learning/questions/<id>/answer/` - Submit answer(s) to a question
  - Request body: `selected_options` (array of option IDs)
  - Returns: Correctness status, updated score, progress, and next question or completion status

- `POST /api/learning/topics/<id>/reset/` - Reset practice progress for a topic
  - Returns: Confirmation of reset

- `GET /api/learning/topics/<id>/history/` - Get test history for completed/failed topics
  - Returns: Full question history with selected options and correctness

### Response Data Structure

Timed tests return additional fields:
- `remaining_seconds` - Time remaining for the current question
- `time_limit_seconds` - Total time limit for the topic
- `timed_out` - Boolean indicating if time has expired
- `passed` - Boolean indicating if the test was passed

Progress tracking includes:
- `progress_percent` - Percentage of questions answered
- `score_percent` - Percentage of correct answers
- `status` - One of: "not_started", "in_progress", "completed", "failed"
- Per-question correctness data for detailed feedback

## Project Structure

```
web_application_thesis/
├── backend/
│   ├── core/
│   │   ├── models/
│   │   │   ├── user.py          # User model with avatar and profile customization
│   │   │   ├── course.py        # Course, Module models
│   │   │   └── learning.py      # Topic, TopicQuestion models with timed test support
│   │   ├── serializers/
│   │   │   ├── user.py          # User serialization with avatar URLs
│   │   │   ├── course.py        # Course serialization
│   │   │   ├── learning.py      # Learning progress serialization
│   │   │   └── teacher.py       # Teacher CRUD serializers
│   │   ├── views/
│   │   │   ├── auth.py          # Registration and profile endpoints
│   │   │   ├── courses.py       # Public course endpoints
│   │   │   ├── learning.py      # Learning and practice endpoints
│   │   │   └── teacher.py       # Teacher CRUD endpoints
│   │   ├── permissions.py       # IsTeacher permission class
│   │   └── urls.py              # URL routing
│   ├── elearn_backend/
│   │   ├── settings.py          # Django settings including media configuration
│   │   └── urls.py              # Root URL configuration
│   ├── media/                   # Uploaded user avatars
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── App.jsx          # Main app component with routing
│   │   ├── pages/
│   │   │   ├── auth/            # Login and registration pages
│   │   │   ├── courses/         # Course catalog and detail pages
│   │   │   ├── learning/        # Learning dashboard and practice pages
│   │   │   ├── profile/         # User profile with customization
│   │   │   ├── settings/        # Theme and language settings
│   │   │   └── teacher/         # Teacher's cabinet pages
│   │   ├── features/
│   │   │   ├── courses/         # Course card component
│   │   │   └── learning/        # Practice question and timer components
│   │   ├── shared/
│   │   │   ├── api/             # API client configuration
│   │   │   ├── lib/             # Theme and language contexts
│   │   │   └── styles/          # Global styles and theme variables
│   │   └── widgets/
│   │       └── layout/          # Main layout with navigation
│   ├── public/
│   └── package.json
├── screenshots/                 # Application screenshots
└── README.md
```

## Configuration

### Backend Configuration

Key settings in `backend/elearn_backend/settings.py`:
- `DATABASES` - PostgreSQL connection settings
- `CORS_ALLOWED_ORIGINS` - Allowed frontend origins for CORS
- `MEDIA_URL` and `MEDIA_ROOT` - Configuration for serving uploaded files
- `JWT_AUTH` settings for token expiration

### Frontend Configuration

- API base URL: Set in `frontend/src/shared/api/client.js` or via `VITE_API_BASE_URL` environment variable
- Default backend URL: `http://127.0.0.1:8000`

## Development Notes

- The application uses JWT tokens stored in cookies for authentication (with cookie consent banner)
- Cookie consent is required on first visit - users must accept cookies to continue
- Image uploads are handled via FormData and stored in `backend/media/users/` (for avatars) and `backend/media/courses/` (for course images)
- Profile background gradients are stored as CSS gradient strings
- Course slugs are automatically generated from titles and made unique
- Course images are displayed in course cards and detail pages
- Teacher permissions are enforced via the `IsTeacher` permission class
- All teacher operations are filtered to only show/modify courses created by the current user
- Course editing interface includes collapsible modules and topics for better space management
- Navigation is locked during timed tests with a visual notification banner

## Future Development Plans

The platform is under active development. Planned features include:

1. User discussions and comments under theoretical content
2. Integration of an online Python code interpreter
3. Support for coding practice questions in addition to multiple-choice
4. In-app shop system for purchasing courses or additional features
5. Enhanced profile features and customization options
6. Additional animations and interactive components
7. Enhanced course content with rich media integration

## License

This project is developed for educational purposes as part of a bachelor's thesis.

## Credits

See the Credits page in the application or `frontend/src/pages/credits/ui/CreditsPage.jsx` for a complete list of technologies, libraries, and resources used in this project.
