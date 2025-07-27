import React from "react";
import Layout from "../components/Utility/Layout";

const MainPage = () => {
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to SmedBox</h1>
        <p className="mt-4 text-gray-600">
          Your medication scheduling companion.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Jadwal Obat
            </h3>
            <p className="text-gray-600 text-sm">
              Kelola jadwal minum obat Anda dengan mudah
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Catatan
            </h3>
            <p className="text-gray-600 text-sm">
              Catat informasi penting tentang obat Anda
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Pengingat
            </h3>
            <p className="text-gray-600 text-sm">
              Dapatkan notifikasi untuk jadwal minum obat
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MainPage;
