import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/conf";
import { useSelector } from "react-redux";

function MyCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const user = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        
        if (!user?.enrolledCourses || user.enrolledCourses.length === 0) return;

        const allCourses = await appwriteService.getCourses();
        const enrolled = allCourses.filter(course =>
          user.enrolledCourses.includes(course.$id)
        );
        setMyCourses(enrolled);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    
    };

    fetchEnrolledCourses();
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">My Enrolled Courses</h2>
      {myCourses.length === 0 ? (
        <p>You have not enrolled in any courses.</p>
      ) : (
        <ul className="space-y-2">
          {myCourses.map(course => (
            <li key={course.$id} className="p-4 bg-gray-100 rounded shadow">
              <strong>{course.title}</strong>
              <p>{course.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyCourses;
