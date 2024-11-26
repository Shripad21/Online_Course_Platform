import React, { useState } from "react";
import appwriteService from "../appwrite/conf";
import env from "../env/env";

const AddLesson = () => {
  const [courseName, setCourseName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoFiles, setVideoFiles] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [courseFound, setCourseFound] = useState(null);

  // Find the course by name
  const handleFindCourse = async () => {
    if (!courseName.trim()) {
      alert("Please enter a course name.");
      return;
    }
    try {
      const course = await appwriteService.getCourseByName(courseName);
      setCourseId(course?.$id);
      setCourseFound(true);
    } catch (error) {
      setCourseFound(false);
      console.error("Course not found:", error);
    }
  };

  // Add lessons with video
  const handleAddLessons = async () => {
    if (!courseId || !lessonTitle || videoFiles.length === 0) {
      alert("Please fill in all fields and upload at least one video.");
      return;
    }
    try {
      for (let i = 0; i < videoFiles.length; i++) {
        const videoFile = videoFiles[i];
        const videoFileId = await appwriteService.uploadVideo(videoFile);
        const videoFileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${env.bucketId}/files/${videoFileId}/view`; // Construct video path (URL)

        await appwriteService.createLesson({
          title: `${lessonTitle} - Lesson ${i + 1}`,
          courseId,
          videoPath: videoFileUrl, // Pass video path
        });
      }
      alert("Lessons added successfully!");
    } catch (error) {
      console.error("Error adding lessons:", error);
      alert("Error adding lessons.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Lessons</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={handleFindCourse}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Find Course
        </button>
        {courseFound !== null && (
          <div className="mt-4 text-lg font-semibold">
            {courseFound ? (
              <span className="text-green-600">Course found!</span>
            ) : (
              <span className="text-red-600">Course not found.</span>
            )}
          </div>
        )}
        {courseFound && (
          <>
            <input
              type="text"
              placeholder="Lesson Title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
            <input
              type="file"
              multiple
              onChange={(e) => setVideoFiles(Array.from(e.target.files))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              onClick={handleAddLessons}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Add Lessons
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddLesson;
