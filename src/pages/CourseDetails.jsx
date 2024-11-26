import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import appwriteService from "../appwrite/conf";

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseData = await appwriteService.getCourseWithLessons(id);
        setCourse(courseData);
        setCurrentLesson(courseData.lessons?.[0] || null); // Default to the first lesson
      } catch (err) {
        setError("Error fetching course details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) {
    return <div className="text-lg text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-lg text-red-600">{error}</div>;
  }

  return course ? (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-md shadow-lg flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {course.title}
          </h1>
          <p className="text-gray-500 italic mb-2">By: {course.author}</p>
          <p className="text-gray-600 mb-4">{course.description}</p>
          {currentLesson && (
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
            {course.lessons &&
              course.lessons.map((lesson) => (
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
