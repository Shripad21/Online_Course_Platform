import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import appwriteService from "../appwrite/conf";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import env from "../env/env";
import { ID } from "appwrite";

// Modern icons (you can replace with your preferred icon library)
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
  </svg>
);

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [txId, setTxId] = useState("");
  const [requested, setRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const user = useSelector((state) => state.auth.userData);
  const role = user?.role;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseData = await appwriteService.getCourseWithLessons(id);
        console.log("Fetched course data:", courseData);
        setCourse(courseData);
        setCurrentLesson(courseData.lessons?.[0] || null);
      } catch (err) {
        setError("Failed to load course details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (user?.role !== "student" || !course?.$id) return;

      try {
        // Check if already enrolled
        if (user.enrolledCourses?.includes(course.$id)) {
          setEnrolled(true);
          return;
        }

        // Check pending payments
        const paymentRes = await appwriteService.databases.listDocuments(
          env.databaseId,
          "pendingPayments",
          [
            appwriteService.Query.equal("userId", user.$id),
            appwriteService.Query.equal("courseId", course.$id),
            appwriteService.Query.equal("status", "approved"),
          ]
        );

        if (paymentRes.documents.length > 0) {
          await authService.enrollInCourse(user.$id, course.$id);
          setEnrolled(true);
        }

        // Check if payment is already requested
        const pendingRes = await appwriteService.databases.listDocuments(
          env.databaseId,
          "pendingPayments",
          [
            appwriteService.Query.equal("userId", user.$id),
            appwriteService.Query.equal("courseId", course.$id),
            appwriteService.Query.equal("status", "pending"),
          ]
        );

        if (pendingRes.documents.length > 0) {
          setRequested(true);
        }
      } catch (err) {
        console.error("Failed to verify enrollment status", err);
      }
    };

    checkEnrollmentStatus();
  }, [user, course]);

  const handleUPISubmit = async () => {
    if (!txId.trim()) {
      alert("Please enter a valid transaction ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      await appwriteService.databases.createDocument(
        env.databaseId,
        "pendingPayments",
        ID.unique(),
        {
          userId: user.$id,
          courseId: course.$id,
          transactionId: txId,
          status: "pending"
        }
      );
      setRequested(true);
      setTxId("");
      alert("Payment submitted successfully! Please wait for admin approval.");
    } catch (err) {
      console.error("Payment submission failed", err);
      alert("Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center -m-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center -m-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 -m-4">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                <div className="flex items-center gap-4 text-blue-100 mb-4">
                  <div className="flex items-center gap-2">
                    <UserIcon />
                    <span>{course.author}</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <ClockIcon />
                      <span>{course.duration}</span>
                    </div>
                  )}
                </div>
                <p className="text-blue-50 text-lg leading-relaxed">{course.description}</p>
              </div>
              <div className="lg:text-right">
                <div className="bg-white/20 backdrop-blur rounded-lg p-6 text-center">
                  <p className="text-blue-100 text-sm uppercase tracking-wide mb-2">Price</p>
                  <p className="text-3xl font-bold">₹{course.price || 499}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <TagIcon />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enrollment Status & Payment */}
          <div className="p-6">
            {role === "student" && enrolled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckIcon className="text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Enrolled Successfully!</h3>
                    <p className="text-green-600">You have full access to all course materials.</p>
                  </div>
                </div>
              </div>
            )}

            {role === "student" && !enrolled && !requested && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-4">Complete Your Enrollment</h3>
                <div className="space-y-4">
                  <p className="text-yellow-700">
                    Send payment to <strong className="font-mono bg-yellow-100 px-2 py-1 rounded">courseupi@bank</strong> 
                    and enter your transaction ID below.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter UPI Transaction ID"
                      className="flex-1 px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={handleUPISubmit}
                      disabled={isSubmitting || !txId.trim()}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Payment'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {role === "student" && requested && !enrolled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <ClockIcon className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Payment Under Review</h3>
                    <p className="text-blue-600">Your transaction is being verified. You'll be notified once approved.</p>
                  </div>
                </div>
              </div>
            )}

            {role === "student" && !enrolled && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium text-center">
                  🔒 Enroll in this course to access all lessons and materials
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            {(role !== "student" || enrolled) && currentLesson ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-black">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={appwriteService.getFilePreview(currentLesson.videoPath)}
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentLesson.title}</h2>
                  <p className="text-slate-600">Currently playing lesson from {course.title}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Content Locked</h3>
                    <p className="text-slate-500">Enroll in this course to watch the lessons</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lessons Sidebar */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Course Lessons</h2>
              <p className="text-slate-600 text-sm mt-1">
                {course.lessons?.length || 0} lessons available
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {course.lessons?.length > 0 ? (
                <div className="p-4 space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.$id}
                      onClick={() => (role !== "student" || enrolled) && setCurrentLesson(lesson)}
                      className={`p-4 rounded-lg transition-all cursor-pointer border ${
                        currentLesson?.$id === lesson.$id
                          ? "bg-blue-50 border-blue-200 shadow-md"
                          : (role !== "student" || enrolled)
                            ? "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:shadow-sm"
                            : "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          currentLesson?.$id === lesson.$id
                            ? "bg-blue-600 text-white"
                            : (role !== "student" || enrolled)
                              ? "bg-slate-200 text-slate-600"
                              : "bg-slate-200 text-slate-400"
                        }`}>
                          {(role !== "student" || enrolled) ? (
                            currentLesson?.$id === lesson.$id ? <PlayIcon /> : index + 1
                          ) : (
                            "🔒"
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            (role !== "student" || enrolled) ? "text-slate-800" : "text-slate-500"
                          }`}>
                            {lesson.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No lessons available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;