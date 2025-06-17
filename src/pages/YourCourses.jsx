import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, Edit3, Users, Clock, IndianRupee, Tag } from "lucide-react";
import appwriteService from "../appwrite/conf";
import EnrolledStudents from "./EnrolledStudents";
import env from "../env/env";

function YourCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  
  const user = useSelector((state) => state.auth.userData);

  const handleDeleteCourse = useCallback(async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingCourse(courseId);
    try {
      await appwriteService.databases.deleteDocument(
        env.databaseId,
        env.collectionId,
        courseId
      );
      
      setCourses(prev => prev.filter(course => course.$id !== courseId));
      
      // Optional: Show success toast instead of alert
      // toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course. Please try again.");
    } finally {
      setDeletingCourse(null);
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.$id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const allCourses = await appwriteService.getCourses();
        const userCourses = allCourses.filter(course => course.userId === user.$id);
        setCourses(userCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load your courses. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.$id]);

  const formatPrice = (price) => {
    if (!price) return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center -m-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center  -m-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Something went wrong</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100  -m-4">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Your Courses</h1>
          <p className="text-slate-600 text-lg">
            Manage and monitor your created courses
          </p>
          <div className="mt-6">
            <Link
              to="/add-course"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <span className="text-lg">+</span>
              Create New Course
            </Link>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-8">Create your first course to get started!</p>
            <Link
              to="/create-course"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <span className="text-lg">+</span>
              Create Course
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:gap-6 lg:gap-8">
            {courses.map(course => (
              <div
                key={course.$id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200"
              >
                <div className="p-6 lg:p-8">
                  {/* Course Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-800 mb-2 line-clamp-2">
                        {course.title}
                      </h2>
                      <p className="text-slate-600 text-base leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 lg:flex-col lg:w-auto">
                      <Link
                        to={`/update-course/${course.$id}`}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDeleteCourse(course.$id, course.title)}
                        disabled={deletingCourse === course.$id}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                      >
                        {deletingCourse === course.$id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Course Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Price</p>
                        <p className="font-semibold text-slate-800">{formatPrice(course.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Duration</p>
                        <p className="font-semibold text-slate-800">{course.duration || "Self-paced"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Created</p>
                        <p className="font-semibold text-slate-800">{formatDate(course.$createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Tag className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Updated</p>
                        <p className="font-semibold text-slate-800">{formatDate(course.$updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-slate-700 mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enrolled Students Section */}
                  <div className="border-t border-slate-200 pt-6">
                    <EnrolledStudents courseId={course.$id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default YourCourses;