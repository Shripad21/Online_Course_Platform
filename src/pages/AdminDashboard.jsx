import React, { useEffect, useState } from "react";
import { Users, BookOpen, DollarSign, GraduationCap, Trash2, UserMinus, CheckCircle, XCircle, TrendingUp, Calendar, Mail } from "lucide-react";
import appwriteService from "../appwrite/conf";
import env from "../env/env";
import { Query } from "appwrite";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0
  });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

      const totalRevenue = allCourses.reduce((acc, course) => acc + (course.price || 0), 0);

      setStats({
        totalUsers: allUsers.length,
        totalCourses: allCourses.length,
        totalEnrollments,
        totalRevenue
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

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
      fetchData(); // Refresh data to update stats
    } catch (err) {
      console.error("Error approving payment:", err);
      alert("Failed to approve payment.");
    }
  };

  const rejectPayment = async (request) => {
    try {
      await appwriteService.databases.updateDocument(
        env.databaseId,
        "pendingPayments",
        request.$id,
        { status: "rejected" }
      );
      setPaymentRequests((prev) => prev.filter((r) => r.$id !== request.$id));
      alert("Payment rejected.");
    } catch (err) {
      console.error("Error rejecting payment:", err);
      alert("Failed to reject payment.");
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
      alert("Failed to remove course from student.");
    }
  };

  const deleteUser = async (userId, docId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await appwriteService.databases.deleteDocument(env.databaseId, "userProfiles", docId);
        alert("User deleted successfully.");
        fetchData();
      } catch (err) {
        console.error("Failed to delete user", err);
        alert("Failed to delete user.");
      }
    }
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await appwriteService.databases.deleteDocument(env.databaseId, "68543414000a2ca40d02", courseId); // your Courses collection ID
        setCourses(prev => prev.filter(c => c.$id !== courseId));
        alert("Course deleted successfully.");
        fetchData(); // Refresh data to update stats
      } catch (err) {
        console.error("Failed to delete course", err);
        alert("Failed to delete course.");
      }
    }
  };

  const getInitials = (name, fallback) => {
    if (!name) return fallback;
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm opacity-80">
              <TrendingUp size={16} className="mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-white bg-opacity-20">
          <Icon size={32} />
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon size={80} />
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
          : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center -m-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -m-4">
      <div className="backdrop-blur-sm bg-white/5 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-300 text-lg">Manage your platform with ease</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              trend="+12% this month"
            />
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              icon={BookOpen}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
              trend="+8% this month"
            />
            <StatCard
              title="Enrollments"
              value={stats.totalEnrollments}
              icon={GraduationCap}
              color="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
              trend="+15% this month"
            />
            <StatCard
              title="Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
              trend="+23% this month"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-8 bg-gray-100 p-2 rounded-2xl w-fit">
            <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton id="students" label="Students" isActive={activeTab === 'students'} onClick={setActiveTab} />
            <TabButton id="teachers" label="Teachers" isActive={activeTab === 'teachers'} onClick={setActiveTab} />
            <TabButton id="courses" label="Courses" isActive={activeTab === 'courses'} onClick={setActiveTab} />
            <TabButton id="payments" label="Payments" isActive={activeTab === 'payments'} onClick={setActiveTab} />
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {students.slice(0, 5).map(student => (
                    <div key={student.$id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(student.name, "S")}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{student.name || "New Student"}</p>
                        <p className="text-gray-300 text-sm">Joined {formatDate(student.$createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Platform Insights</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Student to Teacher Ratio</span>
                    <span className="text-white font-bold">{Math.round(students.length / Math.max(teachers.length, 1))}:1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg. Enrollments per Student</span>
                    <span className="text-white font-bold">{(stats.totalEnrollments / Math.max(students.length, 1)).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Pending Payments</span>
                    <span className="text-white font-bold">{paymentRequests.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div key={student.$id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {getInitials(student.name, "S")}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{student.name || "Anonymous"}</h3>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Mail size={14} className="mr-1" />
                        {student.email || "No email"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Enrolled Courses</span>
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {student.enrolledCourses?.length || 0}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      <Calendar size={14} className="inline mr-1" />
                      Joined {formatDate(student.$createdAt)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {student.enrolledCourses && student.enrolledCourses.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-300 text-xs mb-1">Enrolled Courses:</p>
                        <div className="max-h-20 overflow-y-auto">
                          {student.enrolledCourses.map((courseId, index) => {
                            const course = courses.find(c => c.$id === courseId);
                            return (
                              <div key={index} className="flex items-center justify-between text-xs py-1">
                                <span className="text-gray-400">{course?.title || courseId}</span>
                                <button
                                  onClick={() => removeCourseFromStudent(student, courseId)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <UserMinus size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => deleteUser(student.userId, student.$id)}
                      className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher.$id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {getInitials(teacher.name, "T")}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{teacher.name || "Anonymous"}</h3>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Mail size={14} className="mr-1" />
                        {teacher.email || "No email"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Courses Created</span>
                      <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                        {courses.filter(c => c.userId === teacher.userId).length}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      <Calendar size={14} className="inline mr-1" />
                      Joined {formatDate(teacher.$createdAt)}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteUser(teacher.userId, teacher.$id)}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Teacher
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.$id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="mb-4">
                    <h3 className="text-white font-bold text-xl mb-2">{course.title}</h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <span>by {course.author}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.tags?.map((tag, index) => (
                        <span key={index} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Price</span>
                      <span className="text-white font-bold">
                        {course.price ? `₹${course.price}` : "Free"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCourse(course.$id)}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Course
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              {paymentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
                    <CheckCircle size={64} className="text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-white text-xl font-bold mb-2">All Caught Up!</h3>
                    <p className="text-gray-300">No pending payment requests at the moment.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paymentRequests.map((req) => (
                    <div key={req.$id} className="bg-yellow-500/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30 hover:bg-yellow-500/15 transition-all duration-300">
                      <div className="mb-4">
                        <h3 className="text-white font-bold text-lg mb-2">Payment Request</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">User ID:</span>
                            <span className="text-white font-mono">{req.userId.slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Course ID:</span>
                            <span className="text-white font-mono">{req.courseId.slice(-8)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Transaction ID:</span>
                            <span className="text-white font-mono">{req.transactionId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Date:</span>
                            <span className="text-white">{formatDate(req.$createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => approvePayment(req)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center"
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectPayment(req)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center"
                        >
                          <XCircle size={16} className="mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;