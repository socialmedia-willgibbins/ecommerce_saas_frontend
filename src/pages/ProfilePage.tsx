import React from "react";

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-2xl font-bold">
            A
          </div>
          <h1 className="text-xl font-semibold mt-4">John Doe</h1>
          <p className="text-gray-600">johndoe@example.com</p>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium">johndoe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">+123 456 7890</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium">123 Main St, City</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
