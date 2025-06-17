import React, { useState, useCallback } from "react";
import { Search, Upload, CheckCircle, AlertCircle, Video, Plus, Loader2 } from "lucide-react";
import appwriteService from "../appwrite/conf"; // Adjust the import path as necessary
import env from "../env/env";

const AddLesson = () => {
  const [courseName, setCourseName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [videoFiles, setVideoFiles] = useState([]);
  const [courseData, setCourseData] = useState(null); // Store full course data
  const [courseFound, setCourseFound] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!courseName.trim()) {
      newErrors.courseName = "Course name is required";
    }
    
    if (courseFound && !lessonTitle.trim()) {
      newErrors.lessonTitle = "Lesson title is required";
    }
    
    if (courseFound && videoFiles.length === 0) {
      newErrors.videoFiles = "At least one video file is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [courseName, lessonTitle, videoFiles, courseFound]);

  const handleFindCourse = async () => {
    if (!validateForm()) return;
    
    setIsSearching(true);
    setErrors({});
    
    try {
      const course = await appwriteService.getCourseByName(courseName);
      console.log("Course found:", course);
      setCourseData(course); // Store full course data
      setCourseFound(true);
    } catch (error) {
      setCourseFound(false);
      setCourseData(null);
      setErrors({ courseName: "Course not found" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      return isVideo && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      setErrors({ 
        videoFiles: "Some files were invalid. Only video files under 100MB are allowed." 
      });
    } else {
      setErrors({ ...errors, videoFiles: null });
    }
    
    setVideoFiles(validFiles);
  }, [errors]);

  const handleAddLessons = async () => {
    if (!validateForm() || !courseData) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const totalFiles = videoFiles.length;
      const newLessons = [];
      
      for (let i = 0; i < totalFiles; i++) {
        const videoFile = videoFiles[i];
        
        // Upload video file
        const videoFileId = await appwriteService.uploadVideo(videoFile);
        const videoFileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${env.bucketId}/files/${videoFileId}/view`;

        // Create lesson
        const lesson = await appwriteService.createLesson({
          title: totalFiles > 1 ? `${lessonTitle} - Part ${i + 1}` : lessonTitle,
          courseId: courseData.$id,
          videoPath: videoFileUrl,
        });
        
        newLessons.push(lesson.$id); // Add lesson ID to array
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }
    
      
      // Update local course data
      setCourseData({
        ...courseData,
      });
      
      // Reset form
      setLessonTitle("");
      setVideoFiles([]);
      setUploadProgress(0);
      
      // Show success message
      setErrors({ success: `Successfully added ${totalFiles} lesson${totalFiles > 1 ? 's' : ''} to the course!` });
      
    } catch (error) {
      console.error("Error adding lessons:", error);
      setErrors({ submit: "Failed to add lessons. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCourseName("");
    setLessonTitle("");
    setVideoFiles([]);
    setCourseData(null);
    setCourseFound(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Add Lessons</h1>
          <p className="text-slate-600">Upload video lessons to your course</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Course Search Section */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Course Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter course name to search..."
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                      errors.courseName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                    disabled={isSearching}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                {errors.courseName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.courseName}
                  </p>
                )}
              </div>

              <button
                onClick={handleFindCourse}
                disabled={isSearching || !courseName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Find Course</span>
                  </>
                )}
              </button>

              {/* Course Status */}
              {courseFound !== null && (
                <div className={`rounded-xl ${
                  courseFound 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {courseFound ? (
                    <div className="p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                        <div className="flex-1">
                          <span className="text-green-800 font-bold text-lg block">Course Found!</span>
                          <span className="text-green-700 text-sm">Please confirm this is the correct course before adding lessons.</span>
                        </div>
                      </div>
                      
                      {/* Course Details Card */}
                      <div className="bg-white rounded-lg p-5 border border-green-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-bold text-gray-800 text-xl mb-2">{courseData?.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{courseData?.description}</p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Author:</span>
                                <span className="text-sm text-gray-700">{courseData?.author}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration:</span>
                                <span className="text-sm text-gray-700">{courseData?.duration}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price:</span>
                                <span className="text-sm text-gray-700">₹{courseData?.price}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="mb-4">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Current Status:</span>
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">{courseData?.lessons?.length || 0}</div>
                                  <div className="text-xs text-gray-500">Lessons</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">{courseData?.tags?.length || 0}</div>
                                  <div className="text-xs text-gray-500">Tags</div>
                                </div>
                              </div>
                            </div>
                            
                            {courseData?.tags && courseData.tags.length > 0 && (
                              <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Tags:</span>
                                <div className="flex flex-wrap gap-1">
                                  {courseData.tags.slice(0, 6).map((tag, index) => (
                                    <span 
                                      key={index} 
                                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {courseData.tags.length > 6 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      +{courseData.tags.length - 6} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Course ID: {courseData?.$id}</span>
                            <span>Created: {new Date(courseData?.$createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-800 font-semibold text-sm">
                            ✓ This is the course where your lessons will be added
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex items-center space-x-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-800 font-semibold">Course not found. Please check the name and try again.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lesson Details Section */}
            {courseFound && courseData && (
              <div className="space-y-6 border-t border-slate-200 pt-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter lesson title..."
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                      errors.lessonTitle 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.lessonTitle && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lessonTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Video Files
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                    errors.videoFiles 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium mb-1">
                        Click to upload videos or drag and drop
                      </p>
                      <p className="text-sm text-slate-500">
                        Support for multiple video files (max 100MB each)
                      </p>
                    </div>
                  </div>
                  
                  {videoFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Selected files:</p>
                      {videoFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Video className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-slate-700 flex-1">{file.name}</span>
                          <span className="text-xs text-slate-500">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {errors.videoFiles && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.videoFiles}
                    </p>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Uploading lessons...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {errors.success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-green-800">{errors.success}</span>
                  </div>
                )}

                {/* Error Display */}
                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <span className="text-red-800">{errors.submit}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddLessons}
                    disabled={isUploading || !lessonTitle.trim() || videoFiles.length === 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Add {videoFiles.length > 1 ? `${videoFiles.length} Lessons` : 'Lesson'}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLesson;