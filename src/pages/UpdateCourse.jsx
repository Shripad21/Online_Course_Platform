import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import appwriteService from "../appwrite/conf";
import env from "../env/env";

function UpdateCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const courseData = await appwriteService.getCourseWithLessons(id);
      setCourse(courseData);
      setTitle(courseData.title);
      setDescription(courseData.description);
      setTags(courseData.tags || []);
      setLessons(courseData.lessons || []);
    };
    loadData();
  }, [id]);

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleLessonTitleChange = (lessonId, newTitle) => {
    setLessons(lessons.map(lesson => 
      lesson.$id === lessonId ? { ...lesson, title: newTitle } : lesson
    ));
  };

  const handleLessonDelete = async (lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      await appwriteService.databases.deleteDocument(
        env.databaseId,
        env.lessonCollectionId,
        lessonId
      );
      setLessons(lessons.filter(lesson => lesson.$id !== lessonId));
    }
  };

  const handleUpdate = async () => {
    await appwriteService.databases.updateDocument(
      env.databaseId,
      env.collectionId,
      course.$id,
      { title, description, tags }
    );

    for (const lesson of lessons) {
      await appwriteService.databases.updateDocument(
        env.databaseId,
        env.lessonCollectionId,
        lesson.$id,
        { title: lesson.title }
      );
    }

    alert("Course and lessons updated successfully.");
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Update Course</h2>

      <input
        className="w-full mb-3 p-2 border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course Title"
      />
      <textarea
        className="w-full mb-3 p-2 border"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Course Description"
      />
      <div className="mb-3">
        <input
          className="p-2 border mr-2"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Add tag"
        />
        <button onClick={handleTagAdd} className="bg-blue-500 text-white px-3 py-1 rounded">
          Add
        </button>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-200 px-3 py-1 rounded-full text-sm cursor-pointer"
              onClick={() => handleTagRemove(tag)}
            >
              {tag} &times;
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">Lessons</h3>
      {lessons.map((lesson) => (
        <div key={lesson.$id} className="mb-3 p-3 bg-white rounded shadow">
          <input
            className="w-full p-2 border mb-2"
            value={lesson.title}
            onChange={(e) => handleLessonTitleChange(lesson.$id, e.target.value)}
          />
          <button
            onClick={() => handleLessonDelete(lesson.$id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete Lesson
          </button>
        </div>
      ))}

      <button
        onClick={handleUpdate}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Save Changes
      </button>
    </div>
  );
}

export default UpdateCourse;
