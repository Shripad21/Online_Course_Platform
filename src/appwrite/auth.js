import env from "../env/env"
import { Client, Account, Databases, ID, Role, Permission,Query } from 'appwrite';


class AuthService {
    client = new Client()
    account
    constructor(){
        this.client
            .setEndpoint(env.appwriteUrl)
            .setProject(env.projectId)
        this.account = new Account(this.client)
         this.databases = new Databases(this.client); // ✅ FIXED
    }

    async saveUserProfile({ userId, role}) {
  const commonPermissions = [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId)),
  ];

  if (role === "student") {
    await this.databases.createDocument(
      env.databaseId,
      "68543783002ac0308cf3",
      ID.unique(),
      { userId },
      commonPermissions
    );
  } else if (role === "teacher") {
    await this.databases.createDocument(
      env.databaseId,
      "68543868002d4b911194",
      ID.unique(),
      { userId},
      commonPermissions
    );
  }
}


    async saveUserRole({ userId, role }) {
  try {
    const user = await this.account.get(); // this returns the logged-in user's full object
    const name = user.name;
     const email = user.email;
    console.log("Creating userProfiles doc with:", { userId, role });

   const response =  await this.databases.createDocument(
  env.databaseId,
  'userProfiles',
  ID.unique(),
  { userId, role, enrolledCourses: [], name ,email }, // ✅ initialize as empty array
  [
    Permission.read(Role.user(userId)),
    Permission.write(Role.user(userId))
  ]
);
   await this.saveUserProfile({ userId, role, name, email });
    console.log("Created userProfiles doc:", response);
    return response;
  } catch (error) {
    console.error("authService :: saveUserRole error ::", error);
    throw error;
  }
}

// enrollInCourse method in AppwriteService
async enrollInCourse(userId, courseId) {
  const result = await this.databases.listDocuments(
    env.databaseId,
    "userProfiles",
    [Query.equal("userId", userId)]
  );

  if (!result.documents.length) {
    throw new Error("User profile not found.");
  }

  const profile = result.documents[0];
  const enrolled = profile.enrolledCourses || [];

  if (enrolled.includes(courseId)) {
    throw new Error("Already enrolled.");
  }

  return await this.databases.updateDocument(
    env.databaseId,
    "userProfiles",
    profile.$id,
    {
      enrolledCourses: [...enrolled, courseId],
    }
  );
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


    async createAccount({email, password, name}){
        try {
            const userAccount = await this.account.create(
                ID.unique(),
                email,
                password,
                name
            )
            if(userAccount){
                return this.login({email,password})
            } else {
                return userAccount
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    }
    async login({email, password}){
        try {
            return await this.account.createEmailPasswordSession(
                email,
                password
            )
        } catch (error) {
            console.log('appwrite service login :: error :: ', error)
            throw error
        }
    }
    // async getCurrentUser() {
    //     try {
    //         const response = await this.account.get();
    //         // console.log("User Data: ", response);  // This should log the user data
    //         return response;
    //     } catch (error) {
    //         console.error("Error fetching current user:", error);  // Log the error for debugging
    //         throw error;  // Keep throwing the error for the caller
    //     }
    //     return null;
    // }
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
    return { ...user, role: profile?.role || null ,enrolledCourses: profile?.enrolledCourses || [] };
  } catch (error) {
    console.error("appwrite service :: getCurrentUserWithRole error :: ", error);
    throw error;
  }
}


    async logout(){
        try {
            return await this.account.deleteSessions()
        } catch (error) {
            console.log('appwrite service logout :: error :: ', error)
            throw error
        }
    }
}

const authService = new AuthService()

export default authService