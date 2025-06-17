import React, { useState } from "react";
import appwriteService from "../appwrite/conf";

function EnrolledStudents({ courseId }) {
  const [students, setStudents] = useState([]);
  const [show, setShow] = useState(false);

  const fetchStudents = async () => {
    try {
      const result = await appwriteService.getEnrolledStudentsForCourse(courseId);
      setStudents(result);
    } catch (err) {
      console.error("Error fetching enrolled students:", err);
    }
  };

  const handleToggle = () => {
    if (!show) fetchStudents();
    setShow(!show);
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleToggle}
        className="text-blue-600 underline text-sm"
      >
        {show ? "Hide Enrolled Students" : "View Enrolled Students"}
      </button>
      {show && (
        <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
          {students.length === 0 ? (
            <li>No students enrolled.</li>
          ) : (
            students.map((student) => (
              <li key={student.$id}>        {student.name} - <span className="text-gray-500">{student.email}</span>
</li>
              
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default EnrolledStudents;
