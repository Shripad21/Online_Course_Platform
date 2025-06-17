import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store.js";
import App from "./App";
import {
  Home,
  Login,
  Signup,
  AddCourse,
  AddLesson, // Import AddLesson
  CourseDetails,
  AllCourses,
  MyCourses,
  YourCourses,
  AdminDashboard,
  UpdateCourse
  ,StudentProfile
  ,TeacherProfile
} from "./pages/index.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/all-courses",
        element: <AllCourses />,
      },
      {
        path: "/add-course",
        element: <AddCourse />,
      },
      {
        path: "/add-lesson", // New route for Add Lesson
        element: <AddLesson />,
      },
      {
        path: "/course/:id",
        element: <CourseDetails />,
      },
      {
  path: "/admin",
  element: <AdminDashboard />
},
{
  path: "/update-course/:id",
  element: <UpdateCourse />,
}
,{
  path: "/student-profile",
  element: <StudentProfile />,
},
{
  path: "/teacher-profile",
  element: <TeacherProfile />,
},
      { path: "/your-courses", element: <YourCourses /> },  // ✅ for teachers
      { path: "/my-courses", element: <MyCourses /> },      // ✅ for students
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
