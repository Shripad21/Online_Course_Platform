import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/conf";

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await appwriteService.getCoursesWithLessons();
        setCourses(coursesData);
      } catch (err) {
        setError("Error fetching courses.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Explore Our Courses
      </h1>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.$id}
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative pb-56 mb-4 rounded-md overflow-hidden">
                <video
                  src={
                    appwriteService.getFilePreview(
                      course.lessons?.[0]?.videoPath || ""
                    ) || "/default-thumbnail.png"
                  }
                  alt={course.title || "Course Thumbnail"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {course.title || "Untitled Course"}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                <span className="italic">By:</span>{" "}
                {course.author || "Unknown"}
              </p>
              <Link
                to={`/course/${course.$id}`}
                className="inline-block text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-lg text-gray-600">
          No courses available at the moment.
        </div>
      )}
    </div>
  );
}

export default AllCourses;
