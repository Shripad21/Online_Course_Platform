import React, { useState } from "react";
import appwriteService from "../appwrite/conf";

const AddCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [courseId, setCourseId] = useState(null);

  const handleAddCourse = async () => {
    if (!courseName || !courseDescription || !authorName) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const course = await appwriteService.createCourse({
        title: courseName,
        description: courseDescription,
        author:authorName,
      });
      setCourseId(course.$id);
      alert(`Course created successfully! Course ID: ${course.$id}`);
    } catch (error) {
      alert("Error adding course.");
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-lg shadow-lg min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Course</h2>
      <input
        type="text"
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <textarea
        placeholder="Course Description"
        value={courseDescription}
        onChange={(e) => setCourseDescription(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-4"
      />
      <input
        type="text"
        placeholder="Author Name"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-4"
      />
      <button
        onClick={handleAddCourse}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mt-4"
      >
        Add Course
      </button>
      {courseId && (
        <div className="mt-6 text-green-600">
          Course Created! Add lessons using Course ID:{" "}
          <strong>{courseId}</strong>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
