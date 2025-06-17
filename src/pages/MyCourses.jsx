import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/conf";

const CourseCard = React.memo(({ course }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <div className="p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
          {course.title}
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {course.label}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {course.tags?.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>By {course.author}</span>
        <div className="flex gap-4">
          {course.duration && <span>{course.duration}</span>}
          {course.price && (
            <span className="font-semibold text-green-600">
              ₹{course.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
));

CourseCard.displayName = 'CourseCard';

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-md w-16"></div>
          <div className="h-6 bg-gray-200 rounded-md w-20"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
    <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet. Start learning today!</p>
    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
      Browse Courses
    </button>
  </div>
);

function MyCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = useSelector((state) => state.auth.userData);

  const enrolledCourseIds = useMemo(() => 
    user?.enrolledCourses || [], 
    [user?.enrolledCourses]
  );

  const fetchEnrolledCourses = useCallback(async () => {
    if (enrolledCourseIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const allCourses = await appwriteService.getCourses();
      
      const enrolled = allCourses.filter(course =>
        enrolledCourseIds.includes(course.$id)
      );
      
      setMyCourses(enrolled);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [enrolledCourseIds]);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const handleRetry = () => {
    fetchEnrolledCourses();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Enrolled Courses</h1>
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Enrolled Courses</h1>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.012 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Enrolled Courses</h1>
        <div className="text-sm text-gray-500">
          {myCourses.length} course{myCourses.length !== 1 ? 's' : ''} enrolled
        </div>
      </div>

      {myCourses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map(course => (
            <CourseCard key={course.$id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;