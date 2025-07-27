import React from "react";
import Layout from "../components/Utility/Layout";

const Note = () => {
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Catatan Obat</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Buat Catatan Baru
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Catatan
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan judul catatan..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Catatan
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tulis catatan Anda di sini..."
              />
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              Simpan Catatan
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Catatan Tersimpan
          </h2>
          <div className="text-gray-500 text-center py-8">
            Belum ada catatan yang tersimpan
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Note;
