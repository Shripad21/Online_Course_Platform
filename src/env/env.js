const env = {
  appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL), // endpoint
  projectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
  databaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
  collectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
  bucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
  TinyMCE_API_Key: String(import.meta.env.VITE_TinyMCE_API_KEY),
  lessonCollectionId: String(import.meta.env.VITE_APPWRITE_LESSONCOLLECTION_ID),
};
export default env