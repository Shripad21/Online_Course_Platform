import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/conf";

function Home() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await appwriteService.getCoursesWithLessons();
        setCourses(coursesData);
      } catch (err) {
        setError("Error fetching courses.");
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  if (error) {
    return <div className="text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.$id}
                className="p-4 bg-white rounded-md shadow-lg"
              >
                <h2 className="text-xl font-semibold text-gray-700">
                  {course.title || "Untitled Course"}
                </h2>
                <p className="text-gray-500 mb-2">
                  <span className="italic">By:</span>{" "}
                  {course.author || "Unknown"}
                </p>
                {course.lessons && course.lessons.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-600">
                      Lesson: {course.lessons[0]?.title || "No Title"}
                    </h3>
                    <video
                      src={
                        appwriteService.getFilePreview(
                          course.lessons[0]?.videoPath || ""
                        ) || "/default-thumbnail.png"
                      }
                      alt={course.lessons[0]?.title || "Lesson Thumbnail"}
                      className="w-full h-32 object-cover rounded-md shadow mb-4"
                    />
                  </div>
                ) : (
                  <p className="text-gray-400">No lessons available</p>
                )}
                <Link
                  to={`/course/${course.$id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Course Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div>No courses available</div>
        )}
      </div>
    </div>
  );
}

export default Home;
