import env from "../env/env";
import { Client, Databases, ID, Storage, Account, Query } from "appwrite";

class AppwriteService {
  constructor() {
    this.client = new Client()
      .setEndpoint(env.appwriteUrl)
      .setProject(env.projectId);
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.error("appwrite service :: getCurrentUser error :: ", error);
      throw error;
    }
  }
  // Fetch course by name
  async getCourseByName(courseName) {
    try {
      if (!courseName.trim()) {
        throw new Error("Course name cannot be empty.");
      }
      const response = await this.databases.listDocuments(
        env.databaseId,
        env.collectionId,
        [Query.equal("title", courseName)]
      );
      if (response.documents.length === 0) {
        throw new Error("Course not found");
      }
      return response.documents[0];
    } catch (error) {
      console.error("appwrite service :: getCourseByName error :: ", error);
      throw error;
    }
  }

  // Upload video to Appwrite storage
  async uploadVideo(file) {
    try {
      const response = await this.storage.createFile(
        env.bucketId,
        ID.unique(),
        file
      );
      return response.$id; // Return file ID
    } catch (error) {
      console.log("appwrite service :: uploadVideo error :: ", error);
      throw error;
    }
  }

  // Create lesson and save the video path
  async createLesson({ title, courseId, videoPath }) {
    try {
      const lesson = await this.databases.createDocument(
        env.databaseId,
        env.lessonCollectionId,
        ID.unique(),
        {
          title,
          courseId,
          videoPath, // Include videoPath
        }
      );
      return lesson;
    } catch (error) {
      console.log("appwrite service :: createLesson error :: ", error);
      throw error;
    }
  }
  getFilePreview(fileId) {
    if (!fileId) return null;
    return `${fileId}?project=${env.projectId}`;
  }
  async createCourse({ title, description, author }) {
    try {
      const course = await this.databases.createDocument(
        env.databaseId, // Replace with the correct database ID
        env.collectionId, // Replace with the correct collection ID
        ID.unique(),
        {
          title,
          description,
          author,
        }
      );
      return course;
    } catch (error) {
      console.error("appwrite service :: createCourse error :: ", error);
      throw error;
    }
  }

  // Fetch all courses
  async getCourses() {
    try {
      const response = await this.databases.listDocuments(
        env.databaseId,
        env.collectionId
      );
      return response.documents; // Return list of courses
    } catch (error) {
      console.error("appwrite service :: getCourses error :: ", error);
      throw error;
    }
  }

  async getCoursesWithLessons() {
    try {
      const courses = await this.databases.listDocuments(
        env.databaseId,
        env.collectionId
      );
      const coursesWithLessons = await Promise.all(
        courses.documents.map(async (course) => {
          const lessons = await this.databases.listDocuments(
            env.databaseId,
            env.lessonCollectionId,
            [Query.equal("courseId", course.$id)]
          );
          return { ...course, lessons: lessons.documents };
        })
      );
      return coursesWithLessons;
    } catch (error) {
      console.error(
        "appwrite service :: getCoursesWithLessons error :: ",
        error
      );
      throw error;
    }
  }

  // Fetch course with lessons
  async getCourseWithLessons(courseId) {
    try {
      const courseResponse = await this.databases.getDocument(
        env.databaseId,
        env.collectionId,
        courseId
      );

      const lessonsResponse = await this.databases.listDocuments(
        env.databaseId,
        env.lessonCollectionId,
        [Query.equal("courseId", courseId)]
      );

      return { ...courseResponse, lessons: lessonsResponse.documents };
    } catch (error) {
      console.error(
        "appwrite service :: getCourseWithLessons error :: ",
        error
      );
      throw error;
    }
  }
}

export default new AppwriteService();
