import env from "../env/env";
import { Client, Databases, ID, Storage, Account, Query , Permission, Role} from "appwrite";

class AppwriteService {
  constructor() {
    this.client = new Client()
      .setEndpoint(env.appwriteUrl)
      .setProject(env.projectId);
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }
  async getUserRole(userId) {
  try {
    const result = await this.databases.listDocuments(
      env.databaseId,
      'userProfiles', // Make sure this matches your actual collection ID
      [Query.equal('userId', userId)]
    );
    return result.documents[0]; // returns { userId, role }
  } catch (error) {
    console.error("appwrite service :: getUserRole error :: ", error);
    throw error;
  }
}
  // async getCurrentUser() {
  //   try {
  //     return await this.account.get();
  //   } catch (error) {
  //     console.error("appwrite service :: getCurrentUser error :: ", error);
  //     throw error;
  //   }
  // }

  async getCurrentUserWithRole() {
  try {
    const user = await this.account.get();
    const profile = await this.getUserRole(user.$id); // Fetch role from `userProfiles`
    return { ...user, role: profile?.role || null,
      enrolledCourses: profile?.enrolledCourses || []  };
  } catch (error) {
    console.error("appwrite service :: getCurrentUserWithRole error :: ", error);
    throw error;
  }
}

async getEnrolledStudentsForCourse(courseId) {
  try {
    const result = await this.databases.listDocuments(
      env.databaseId,
      "userProfiles",
      [Query.search("enrolledCourses", courseId)]
    );
    return result.documents;
  } catch (error) {
    console.error("appwrite :: getEnrolledStudentsForCourse error ::", error);
    throw error;
  }
}
  // Fetch course by name
async getCourseByName(courseName) {
  try {
    if (!courseName.trim()) {
      throw new Error("Course name cannot be empty.");
    }
    
    // Fetch all documents and filter client-side
    const response = await this.databases.listDocuments(
      env.databaseId,
      env.collectionId
    );
    
    // Filter for courses that contain the search term (case-insensitive)
    const matchingCourses = response.documents.filter(doc => 
      doc.title.toLowerCase().includes(courseName.toLowerCase())
    );
    
    if (matchingCourses.length === 0) {
      throw new Error("Course not found");
    }
    
    return matchingCourses[0];
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
     const user = await this.account.get();

  // ✅ Fetch the course to get owner info
  const course = await this.databases.getDocument(
    env.databaseId,
    env.collectionId,
    courseId
  );

  if (course.userId !== user.$id) {
    throw new Error("You do not have permission to add lessons to this course.");
  }
      const lesson = await this.databases.createDocument(
        env.databaseId,
        env.lessonCollectionId,
        ID.unique(),
        {
          title,
          courseId,
          videoPath, // Include videoPath
          
        },
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
  async createCourse({ title, description, author,tags,price,duration }) {
    try {
      const user = await this.account.get();
const profile = await this.getUserRole(user.$id); // ✅ fixed
    const role = profile?.role;
    

if (role !== 'teacher' && role !== 'admin') {
  throw new Error("You do not have permission to create content.");
}



      const course = await this.databases.createDocument(
        env.databaseId, // Replace with the correct database ID
        env.collectionId, // Replace with the correct collection ID
        ID.unique(),
        {
          title,
          description,
          author,
           label: role,      // ✅ Label is now set as user role
        userId: user.$id,
        tags,
        price,
        duration,
         $permissions: [
      Permission.read(Role.any()),
      Permission.write(Role.user(user.$id)),
      Permission.write(Role.user('6830ae4a0000370be320'))
    ]
        },
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
