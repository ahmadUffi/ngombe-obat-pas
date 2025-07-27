import React from "react";
import Layout from "../components/Utility/Layout";

const Control = () => {
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel Kontrol</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pengaturan Akun
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Edit Profile
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Ubah Password
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Pengaturan Notifikasi
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Data & Backup
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Export Data
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Import Data
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Reset Data
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Bantuan
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Panduan Penggunaan
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                FAQ
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded-md">
                Hubungi Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Control;
