import React, { useState, useEffect } from "react";
import appwriteService from "../appwrite/conf";
import { useSelector } from "react-redux";
import env from "../env/env";
import { ID, Query } from "appwrite";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function TeacherProfile() {
  const user = useSelector((state) => state.auth.userData);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    qualification: "",
    subjects: "",
    experience: "",
    contact: "",
    address: "",
  });
  const [documentId, setDocumentId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await appwriteService.databases.listDocuments(
          env.databaseId,
          "684fff9b0027262f01cd", // teacherProfiles collection ID
          [Query.equal("userId", user.$id)]
        );
        if (res.documents.length > 0) {
          const doc = res.documents[0];
          setProfile(doc);
          setDocumentId(doc.$id);
          setFormData({
            qualification: doc.qualification,
            subjects: doc.subjects,
            experience: doc.experience,
            contact: doc.contact,
            address: doc.address,
          });
        }
      } catch {
        setProfile(null);
      }
    };

    if (user?.$id) fetchProfile();
  }, [user?.$id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.qualification) errs.qualification = "Qualification is required";
    if (!formData.subjects) errs.subjects = "Subjects are required";
    if (!formData.experience) errs.experience = "Experience is required";
    if (!formData.contact) errs.contact = "Contact is required";
    if (!formData.address) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        userId: user.$id,
        experience: parseInt(formData.experience, 10),
      };

      if (documentId) {
        await appwriteService.databases.updateDocument(
          env.databaseId,
          "684fff9b0027262f01cd",
          documentId,
          payload
        );
        toast.success("Profile updated successfully!");
      } else {
        const newDoc = await appwriteService.databases.createDocument(
          env.databaseId,
          "684fff9b0027262f01cd",
          ID.unique(),
          payload
        );
        setDocumentId(newDoc.$id);
        toast.success("Profile created successfully!");
      }

      setProfile(payload);
      setEditMode(false);
    } catch (err) {
      toast.error("Failed to save teacher profile");
    } finally {
      setLoading(false);
    }
  };

  // Use user's name for initials, fallback to "T"
  const initials = user?.name ? getInitials(user.name) : "T";

  return (
    <div className="bg-gradient-to-tr from-blue-100 via-white to-blue-50 min-h-screen py-10">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Teacher Profile</h2>

        <AnimatePresence mode="wait">
          {!profile && !editMode && (
            <motion.div
              key="no-profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-gray-600 flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700 mb-4 shadow">
                {initials}
              </div>
              <p>No profile found.</p>
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Create Profile
              </button>
            </motion.div>
          )}

          {profile && !editMode && (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center bg-blue-50 rounded-lg shadow p-6"
            >
              <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700 mb-4 shadow">
                {initials}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 w-full">
                <div>
                  <span className="font-semibold text-blue-700">Qualification:</span> {profile.qualification}
                </div>
                <div>
                  <span className="font-semibold text-blue-700">Subjects:</span> {profile.subjects}
                </div>
                <div>
                  <span className="font-semibold text-blue-700">Experience:</span> {profile.experience} years
                </div>
                <div>
                  <span className="font-semibold text-blue-700">Contact:</span> {profile.contact}
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-blue-700">Address:</span> {profile.address}
                </div>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="mt-6 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Update Profile
              </button>
            </motion.div>
          )}

          {editMode && (
            <motion.form
              key="profile-edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-4"
              onSubmit={e => { e.preventDefault(); handleSubmit(); }}
            >
              <div>
                <label className="block font-medium mb-1">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.qualification ? 'border-red-500' : ''}`}
                  placeholder="Qualification"
                />
                {errors.qualification && <span className="text-red-500 text-sm">{errors.qualification}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Subjects</label>
                <input
                  type="text"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.subjects ? 'border-red-500' : ''}`}
                  placeholder="Subjects you can teach"
                />
                {errors.subjects && <span className="text-red-500 text-sm">{errors.subjects}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience ? 'border-red-500' : ''}`}
                  placeholder="Years of experience"
                  min={0}
                />
                {errors.experience && <span className="text-red-500 text-sm">{errors.experience}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.contact ? 'border-red-500' : ''}`}
                  placeholder="Contact number"
                />
                {errors.contact && <span className="text-red-500 text-sm">{errors.contact}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="Address"
                />
                {errors.address && <span className="text-red-500 text-sm">{errors.address}</span>}
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TeacherProfile;
