import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import appwriteService from "../appwrite/conf";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import env from "../env/env";
import { ID } from "appwrite";

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [txId, setTxId] = useState("");
  const [requested, setRequested] = useState(false);

  const { id } = useParams();
  const user = useSelector((state) => state.auth.userData);
  const role = user?.role;

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseData = await appwriteService.getCourseWithLessons(id);
        setCourse(courseData);
        setCurrentLesson(courseData.lessons?.[0] || null);
      } catch (err) {
        setError("Error fetching course details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  useEffect(() => {
  const checkEnrollmentStatus = async () => {
    if (user?.role !== "student" || !course?.$id) return;

    try {
      // 1. Check if the course is already in enrolledCourses
      if (user.enrolledCourses?.includes(course.$id)) {
        setEnrolled(true);
        return;
      }

      // 2. Otherwise, check the pendingPayments collection for approval
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
        // Optional: update user’s enrolledCourses immediately
        await authService.enrollInCourse(user.$id, course.$id);
        setEnrolled(true);
      }
    } catch (err) {
      console.error("Failed to verify enrollment status", err);
    }
  };

  checkEnrollmentStatus();
}, [user, course]);


  const handleUPISubmit = async () => {
    if (!txId.trim()) return alert("Transaction ID is required.");
    try {
      await appwriteService.databases.createDocument(
        env.databaseId,
        "pendingPayments", // ✅ your Appwrite collection ID
        ID.unique(),
        {
          userId: user.$id,
          courseId: course.$id,
          transactionId: txId,
          status: "pending"
        }
      );
      setRequested(true);
      alert("Transaction submitted. Wait for admin approval.");
    } catch (err) {
      console.error("Payment submission failed", err);
      alert("Failed to submit transaction.");
    }
  };

  if (loading) return <div className="text-lg text-gray-500">Loading...</div>;
  if (error) return <div className="text-lg text-red-600">{error}</div>;

  return course ? (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-md shadow-lg flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
          <p className="text-gray-500 italic mb-2">By: {course.author}</p>
          <p className="text-gray-600 mb-2">{course.description}</p>
          <p className="text-blue-600 font-semibold mb-4">Price: ₹{course.price || 499}</p>

          {/* UPI Payment Flow */}
          {role === "student" && !enrolled && (
            <>
              <p className="mb-2 text-gray-700">
                Please scan the UPI QR code or send payment to <strong>courseupi@bank</strong>.
              </p>
              <input
                type="text"
                placeholder="Enter UPI Transaction ID"
                className="px-4 py-2 border rounded w-full mb-2"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
              <button
                onClick={handleUPISubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Submit Transaction ID
              </button>
              {requested && (
                <p className="mt-3 text-yellow-600 font-medium">
                  Transaction submitted. Please wait for admin approval.
                </p>
              )}
            </>
          )}

          {role === "student" && enrolled && (
            <div className="mb-4 text-green-700 font-semibold">
              You are enrolled in this course.
            </div>
          )}

          {role === "student" && !enrolled && (
            <p className="text-red-500 font-semibold mt-4">
              You must be enrolled to view the lessons.
            </p>
          )}

          {(role !== "student" || enrolled) && currentLesson && (
            <video
              controls
              className="w-full h-64 lg:h-[400px] object-cover rounded-md shadow"
              src={appwriteService.getFilePreview(currentLesson.videoPath)}
            />
          )}
        </div>

        <div className="lg:w-1/3 bg-gray-50 p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Lessons</h2>
          <ul className="space-y-3">
            {course.lessons?.map((lesson) => (
              <li
                key={lesson.$id}
                onClick={() => setCurrentLesson(lesson)}
                className={`p-2 bg-white rounded-md shadow cursor-pointer ${
                  currentLesson?.$id === lesson.$id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
              >
                {lesson.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  ) : null;
}

export default CourseDetails;
