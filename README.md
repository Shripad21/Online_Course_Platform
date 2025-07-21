# 🎓 Online Course Platform

A full-stack web application that enables educators to create and manage courses while allowing students to enroll, track progress, and learn via video content — all powered by modern web technologies.

## 🚀 Features

### 👨‍🏫 For Teachers
- Create, update, and delete courses
- Add sections and upload lessons (video content)
- Role-based access (teachers can only modify their content)

### 👩‍🎓 For Students
- Browse and enroll in courses
- Track learning progress
- Manual UPI payment with admin approval
- View lessons in YouTube-style layout

### 🛠️ Admin Panel
- Approve student enrollments
- Remove users or students from courses
- Delete courses or lessons if necessary

## 🧱 Tech Stack

### Frontend:
- React.js (Tailwind CSS, React Router)
- Axios (API requests)



### Storage & Authentication:
- Appwrite (for authentication and role-based access control)


## 🧑‍💻 User Roles

- **Admin**: Platform manager with full access
- **Teacher**: Can manage their own courses and lessons
- **Student**: Can browse, enroll, and watch courses

## 🔒 Authentication & Authorization

- Role-based login via Appwrite
- Protected routes for each role
- Separate profile pages:
  - **Student Profile**: academic marks, address, DOB, contact
  - **Teacher Profile**: qualifications, experience

## 📦 Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/online-course-platform.git
cd online-course-platform
npm install
npm run dev
```

📸 UI Preview
Video player with lesson list

Clean course detail page

Admin dashboard with user/course control
