import React, { useState } from "react";
import appwriteService from "../appwrite/conf";

const AddCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [courseId, setCourseId] = useState(null);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCourse = async () => {
    if (
      !courseName ||
      !courseDescription ||
      !authorName ||
      tags.length === 0 ||
      !price ||
      !duration
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const course = await appwriteService.createCourse({
        title: courseName,
        description: courseDescription,
        author: authorName,
        tags: tags,
        price: parseInt(price, 10),
        duration: duration,
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

      <input
        type="number"
        placeholder="Course Price (e.g. 499)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-4"
      />

      <input
        type="text"
        placeholder="Course Duration (e.g. 6 weeks, 30 hours)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-4"
      />

      {/* Tags Input */}
      <div className="mt-4">
        <label className="block mb-1 font-semibold">Tags (e.g., AI, ML, Java)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter tag and press Add"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {/* Show Added Tags */}
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer"
              onClick={() => handleRemoveTag(tag)}
              title="Click to remove"
            >
              {tag} &times;
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={handleAddCourse}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mt-6"
      >
        Add Course
      </button>

      {courseId && (
        <div className="mt-6 text-green-600">
          Course Created! Add lessons using Course ID: <strong>{courseId}</strong>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
