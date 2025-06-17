import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/conf";

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await appwriteService.getCoursesWithLessons();
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (err) {
        setError("Error fetching courses.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter based on search
  useEffect(() => {
    if (searchTag.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const lowerTag = searchTag.toLowerCase();
      const filtered = courses.filter(course =>
        course.tags?.some(tag => tag.toLowerCase().includes(lowerTag))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTag, courses]);

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Explore Our Courses
      </h1>

      {/* 🔍 Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by tag (e.g., AI, Python, ML)"
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
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
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {course.title || "Untitled Course"}
              </h2>
              <p className="text-sm text-gray-500 mb-2 italic">
                By: {course.author || "Unknown"}
              </p>
              {course.tags && (
                <div className="flex flex-wrap gap-2 mb-2 text-xs text-blue-600">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
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
          No courses found with tag <strong>{searchTag}</strong>
        </div>
      )}
    </div>
  );
}

export default AllCourses;
