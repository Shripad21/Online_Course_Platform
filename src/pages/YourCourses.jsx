import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/conf";
import { useSelector } from "react-redux";
import EnrolledStudents from "./EnrolledStudents";
import { Link } from "react-router-dom";
import env from "../env/env";

function YourCourses() {
  const [yourCourses, setYourCourses] = useState([]);
  const user = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const allCourses = await appwriteService.getCourses();
        const filtered = allCourses.filter(course => course.userId === user.$id);
        setYourCourses(filtered);
      } catch (error) {
        console.error("Error fetching your courses:", error);
      }
    };

    if (user?.$id) fetchCourses();
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Courses</h2>
      {yourCourses.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No courses found.</p>
      ) : (
        <ul className="space-y-6">
          {yourCourses.map(course => (
            <li
              key={course.$id}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
                <p className="text-gray-600 mt-1">{course.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  to={`/update-course/${course.$id}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  ✏️ Edit Course
                </Link>

                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to delete this course?")) {
                      try {
                        await appwriteService.databases.deleteDocument(
                          env.databaseId,
                          env.collectionId,
                          course.$id
                        );
                        setYourCourses((prev) =>
                          prev.filter((c) => c.$id !== course.$id)
                        );
                        alert("Course deleted successfully.");
                      } catch (error) {
                        console.error("Error deleting course:", error);
                        alert("Failed to delete course.");
                      }
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  🗑️ Delete Course
                </button>
              </div>

              {/* Enrolled Students */}
              <div className="mt-5">
                <EnrolledStudents courseId={course.$id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default YourCourses;
