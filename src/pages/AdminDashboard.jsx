import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/conf";
import env from "../env/env";
import { Query } from "appwrite";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await appwriteService.databases.listDocuments(env.databaseId, "userProfiles");
      const coursesRes = await appwriteService.getCourses();
      const allUsers = usersRes.documents;
      const allCourses = coursesRes;
      const studentUsers = allUsers.filter((user) => user.role === "student");
      const teacherUsers = allUsers.filter((user) => user.role === "teacher");

      setStudents(studentUsers);
      setTeachers(teacherUsers);
      setCourses(allCourses);

      const totalEnrollments = studentUsers.reduce(
        (acc, user) => acc + (user.enrolledCourses?.length || 0), 0
      );

      setStats({
        totalUsers: allUsers.length,
        totalCourses: allCourses.length,
        totalEnrollments,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const fetchPaymentRequests = async () => {
      try {
        const res = await appwriteService.databases.listDocuments(env.databaseId, "pendingPayments");
        setPaymentRequests(res.documents.filter(req => req.status === "pending"));
      } catch (err) {
        console.error("Failed to load payment requests", err);
      }
    };
    fetchPaymentRequests();
  }, []);

  const approvePayment = async (request) => {
    try {
      const userRes = await appwriteService.databases.listDocuments(
        env.databaseId,
        "userProfiles",
        [Query.equal("userId", request.userId)]
      );
      const userDoc = userRes.documents[0];

      await appwriteService.databases.updateDocument(
        env.databaseId,
        "userProfiles",
        userDoc.$id,
        { enrolledCourses: [...(userDoc.enrolledCourses || []), request.courseId] }
      );

      await appwriteService.databases.updateDocument(
        env.databaseId,
        "pendingPayments",
        request.$id,
        { status: "approved" }
      );

      setPaymentRequests((prev) => prev.filter((r) => r.$id !== request.$id));
      alert("Payment approved successfully.");
    } catch (err) {
      console.error("Error approving payment:", err);
      alert("Failed to approve payment.");
    }
  };

  const removeCourseFromStudent = async (userDoc, courseId) => {
    try {
      const updatedCourses = userDoc.enrolledCourses.filter(c => c !== courseId);
      await appwriteService.databases.updateDocument(env.databaseId, "userProfiles", userDoc.$id, {
        enrolledCourses: updatedCourses
      });
      alert("Course removed from student.");
      fetchData();
    } catch (err) {
      console.error("Failed to remove course from student", err);
    }
  };

  const deleteUser = async (userId, docId) => {
    try {
      await appwriteService.databases.deleteDocument(env.databaseId, "userProfiles", docId);
      alert("User deleted.");
      fetchData();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await appwriteService.databases.deleteDocument(env.databaseId, "67419e310012c35445c5", courseId); // your Courses collection ID
      setCourses(prev => prev.filter(c => c.$id !== courseId));
    } catch (err) {
      console.error("Failed to delete course", err);
    }
  };

  // Utility for avatar initials
  const getInitials = (name, fallback) => {
    if (!name) return fallback;
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-gradient-to-tr from-blue-100 via-white to-blue-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-200 p-6 rounded-xl shadow flex flex-col items-center">
            <span className="text-5xl font-bold text-blue-700">{stats.totalUsers}</span>
            <span className="mt-2 text-lg font-semibold text-blue-800">Total Users</span>
          </div>
          <div className="bg-green-200 p-6 rounded-xl shadow flex flex-col items-center">
            <span className="text-5xl font-bold text-green-700">{stats.totalCourses}</span>
            <span className="mt-2 text-lg font-semibold text-green-800">Total Courses</span>
          </div>
          <div className="bg-purple-200 p-6 rounded-xl shadow flex flex-col items-center">
            <span className="text-5xl font-bold text-purple-700">{stats.totalEnrollments}</span>
            <span className="mt-2 text-lg font-semibold text-purple-800">Total Enrollments</span>
          </div>
        </div>

        {/* Students */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">All Students</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {students.map((student) => (
                <div key={student.$id} className="bg-white p-5 rounded-xl shadow flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center text-lg font-bold text-blue-800 mr-3">
                      {getInitials(student.name, "S")}
                    </div>
                    <div>
                      <span className="font-semibold">{student.name || student.userId}</span>
                      <span className="block text-xs text-gray-500">Student</span>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Enrolled in:</span> {student.enrolledCourses?.length || 0}
                  </div>
                  <ul className="ml-5 text-sm text-gray-700 list-disc">
                    {courses.filter(c => student.enrolledCourses?.includes(c.$id)).map(c => (
                      <li key={c.$id}>
                        {c.title}
                        <button
                          className="ml-2 text-red-500 text-xs underline hover:text-red-700"
                          onClick={() => removeCourseFromStudent(student, c.$id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-4 self-end text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
                    onClick={() => deleteUser(student.userId, student.$id)}
                  >
                    Delete Student
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Teachers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">All Teachers</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher.$id} className="bg-white p-5 rounded-xl shadow flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-green-300 flex items-center justify-center text-lg font-bold text-green-800 mr-3">
                      {getInitials(teacher.name, "T")}
                    </div>
                    <div>
                      <span className="font-semibold">{teacher.name || teacher.userId}</span>
                      <span className="block text-xs text-gray-500">Teacher</span>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Courses Created:</span> {
                      courses.filter(c => c.userId === teacher.userId).length
                    }
                  </div>
                  <ul className="ml-5 text-sm text-gray-700 list-disc">
                    {courses.filter(c => c.userId === teacher.userId).map(c => (
                      <li key={c.$id}>{c.title}</li>
                    ))}
                  </ul>
                  <button
                    className="mt-4 self-end text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
                    onClick={() => deleteUser(teacher.userId, teacher.$id)}
                  >
                    Delete Teacher
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">All Courses</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course.$id} className="bg-white p-5 rounded-xl shadow flex flex-col">
                  <span className="font-semibold text-lg">{course.title}</span>
                  <span className="text-sm text-gray-600 mb-1">by {course.author}</span>
                  <p className="text-gray-700 mb-2">{course.description}</p>
                  <button
                    className="mt-auto bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    onClick={() => deleteCourse(course.$id)}
                  >
                    Delete Course
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* UPI Payments */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Pending UPI Payments</h2>
          {paymentRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentRequests.map((req) => (
                <div key={req.$id} className="bg-yellow-100 p-5 rounded-xl shadow flex flex-col">
                  <p><strong>User ID:</strong> {req.userId}</p>
                  <p><strong>Course ID:</strong> {req.courseId}</p>
                  <p><strong>Transaction ID:</strong> {req.transactionId}</p>
                  <button
                    className="mt-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    onClick={() => approvePayment(req)}
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
