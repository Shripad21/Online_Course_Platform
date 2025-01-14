import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/conf";

function Home() {
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

  const featuredCourse = courses[0];
  const otherCourses = courses.slice(1);

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* Featured Course Section */}
      {featuredCourse && (
        <div className="bg-white rounded-lg shadow-md mb-8 p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Featured Course
          </h1>
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <video
                src={
                  appwriteService.getFilePreview(
                    featuredCourse.lessons?.[0]?.videoPath || ""
                  ) || "/default-thumbnail.png"
                }
                alt={featuredCourse.title || "Featured Course Thumbnail"}
                className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-md shadow"
              />
            </div>
            <div className="w-full md:w-1/2 md:pl-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2">
                {featuredCourse.title || "Untitled Course"}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                <span className="italic">By:</span>{" "}
                {featuredCourse.author || "Unknown"}
              </p>
              <p className="text-gray-500 mb-6">
                {featuredCourse.lessons?.[0]?.title ||
                  "Explore this amazing course to learn more."}
              </p>
              <Link
                to={`/course/${featuredCourse.$id}`}
                className="inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition text-center"
              >
                View Course
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Other Courses Section */}
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">
          Other Courses
        </h2>
        {otherCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCourses.map((course) => (
              <div
                key={course.$id}
                className="p-4 bg-white rounded-md shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <video
                  src={
                    appwriteService.getFilePreview(
                      course.lessons?.[0]?.videoPath || ""
                    ) || "/default-thumbnail.png"
                  }
                  alt={course.title || "Course Thumbnail"}
                  className="w-full h-40 sm:h-48 lg:h-56 object-cover rounded-md shadow mb-4"
                />
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">
                  {course.title || "Untitled Course"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  <span className="italic">By:</span>{" "}
                  {course.author || "Unknown"}
                </p>
                <Link
                  to={`/course/${course.$id}`}
                  className="text-blue-500 hover:underline text-sm block"
                >
                  View Course Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">No additional courses available.</div>
        )}
      </div>
    </div>
  );
}

export default Home;
