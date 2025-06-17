import React, { useState, useEffect } from "react";
import appwriteService from "../appwrite/conf";
import { useSelector } from "react-redux";
import env from "../env/env";
import { ID, Query } from "appwrite";

function getInitials(name) {
  if (!name) return "S";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StudentProfile() {
  const user = useSelector((state) => state.auth.userData);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    tenthMarks: "",
    twelfthMarks: "",
    currentDegree: "",
    passingYear: "",
    address: "",
    contactNumber: "",
    dob: "",
  });
  const [docId, setDocId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await appwriteService.databases.listDocuments(
          env.databaseId,
          "684ffe72002cf6eb28d6", // studentProfiles collection ID
          [Query.equal("userId", user.$id)]
        );
        if (res.documents.length > 0) {
          const doc = res.documents[0];
          setProfile(doc);
          setDocId(doc.$id);
          setFormData({
            tenthMarks: doc.tenthMarks,
            twelfthMarks: doc.twelfthMarks,
            currentDegree: doc.currentDegree,
            passingYear: doc.passingYear,
            address: doc.address,
            contactNumber: doc.contactNumber,
            dob: doc.dob?.split("T")[0] || "",
          });
        }
      } catch (err) {
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
    if (!formData.tenthMarks) errs.tenthMarks = "Required";
    if (!formData.twelfthMarks) errs.twelfthMarks = "Required";
    if (!formData.currentDegree) errs.currentDegree = "Required";
    if (!formData.passingYear) errs.passingYear = "Required";
    if (!formData.address) errs.address = "Required";
    if (!formData.contactNumber) errs.contactNumber = "Required";
    if (!formData.dob) errs.dob = "Required";
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
        tenthMarks: parseInt(formData.tenthMarks),
        twelfthMarks: parseInt(formData.twelfthMarks),
        passingYear: parseInt(formData.passingYear),
        dob: new Date(formData.dob).toISOString(),
      };

      if (docId) {
        await appwriteService.databases.updateDocument(
          env.databaseId,
          "684ffe72002cf6eb28d6",
          docId,
          payload
        );
      } else {
        const newDoc = await appwriteService.databases.createDocument(
          env.databaseId,
          "684ffe72002cf6eb28d6",
          ID.unique(),
          payload
        );
        setDocId(newDoc.$id);
      }

      setProfile(payload);
      setEditMode(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // Optionally show error feedback
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name ? getInitials(user.name) : "S";

  return (
    <div className="bg-gradient-to-tr from-blue-100 via-white to-blue-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Student Profile</h2>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700 shadow">
            {initials}
          </div>
        </div>

        {!profile && !editMode && (
          <div className="text-gray-600 flex flex-col items-center">
            <p>No profile found.</p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Create Profile
            </button>
          </div>
        )}

        {profile && !editMode && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
              <div><span className="font-semibold text-blue-700">10th Marks:</span> {profile.tenthMarks}</div>
              <div><span className="font-semibold text-blue-700">12th Marks:</span> {profile.twelfthMarks}</div>
              <div><span className="font-semibold text-blue-700">Degree:</span> {profile.currentDegree}</div>
              <div><span className="font-semibold text-blue-700">Passing Year:</span> {profile.passingYear}</div>
              <div><span className="font-semibold text-blue-700">Contact:</span> {profile.contactNumber}</div>
              <div><span className="font-semibold text-blue-700">Address:</span> {profile.address}</div>
              <div className="md:col-span-2"><span className="font-semibold text-blue-700">Date of Birth:</span> {profile.dob?.split("T")[0]}</div>
            </div>

            <button
              onClick={() => setEditMode(true)}
              className="mt-6 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Update Profile
            </button>
          </>
        )}

        {editMode && (
          <form
            className="mt-6 space-y-4"
            onSubmit={e => { e.preventDefault(); handleSubmit(); }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">10th Grade Marks</label>
                <input
                  type="number"
                  name="tenthMarks"
                  value={formData.tenthMarks}
                  onChange={handleChange}
                  placeholder="10th Grade Marks"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.tenthMarks ? 'border-red-500' : ''}`}
                />
                {errors.tenthMarks && <span className="text-red-500 text-sm">{errors.tenthMarks}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">12th Grade Marks</label>
                <input
                  type="number"
                  name="twelfthMarks"
                  value={formData.twelfthMarks}
                  onChange={handleChange}
                  placeholder="12th Grade Marks"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.twelfthMarks ? 'border-red-500' : ''}`}
                />
                {errors.twelfthMarks && <span className="text-red-500 text-sm">{errors.twelfthMarks}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Current Degree</label>
                <input
                  type="text"
                  name="currentDegree"
                  value={formData.currentDegree}
                  onChange={handleChange}
                  placeholder="Current Degree"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.currentDegree ? 'border-red-500' : ''}`}
                />
                {errors.currentDegree && <span className="text-red-500 text-sm">{errors.currentDegree}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Passing Year</label>
                <input
                  type="number"
                  name="passingYear"
                  value={formData.passingYear}
                  onChange={handleChange}
                  placeholder="Passing Year"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.passingYear ? 'border-red-500' : ''}`}
                />
                {errors.passingYear && <span className="text-red-500 text-sm">{errors.passingYear}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.contactNumber ? 'border-red-500' : ''}`}
                />
                {errors.contactNumber && <span className="text-red-500 text-sm">{errors.contactNumber}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && <span className="text-red-500 text-sm">{errors.address}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.dob ? 'border-red-500' : ''}`}
                />
                {errors.dob && <span className="text-red-500 text-sm">{errors.dob}</span>}
              </div>
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
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {saved && !editMode && (
          <p className="mt-4 text-green-600 font-medium text-center">Profile saved successfully!</p>
        )}
      </div>
    </div>
  );
}

export default StudentProfile;
