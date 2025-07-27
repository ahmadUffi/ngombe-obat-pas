import React, { useState, useEffect } from "react";
import Layout from "../components/Utility/Layout";
import { useHistory } from "../hooks/useApi";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllHistory, loading, error, setError } = useHistory();

  // Dummy data for initial development - matches backend createHistory format
  const dummyHistoryData = [
    {
      id: "2c5f6f2e-3d51-4639-a82a-4f09d766c684",
      user_id: "09432a55-60f5-4197-a44c-dddd75443a77",
      profile_id: "e4060dc2-ce3d-49ad-bc2a-de55f1e9e333",
      nama_obat: "Antimo",
      dosis_obat: "1 tablet",
      sisa_obat: 15,
      status: "tidak diminum",
      waktu_minum: ["08:00"],
      created_at: "2025-07-25T03:48:47.915727",
    },
    {
      id: "3d6f7g3f-4e62-5740-b93b-5f10e867d795",
      user_id: "09432a55-60f5-4197-a44c-dddd75443a77",
      profile_id: "e4060dc2-ce3d-49ad-bc2a-de55f1e9e333",
      nama_obat: "Paracetamol",
      dosis_obat: "2 tablet",
      sisa_obat: 25,
      status: "diminum",
      waktu_minum: ["12:00", "20:00"],
      created_at: "2025-07-24T14:30:22.617834",
    },
    {
      id: "4e7g8h4g-5f73-6851-c04c-6g21f978e806",
      user_id: "09432a55-60f5-4197-a44c-dddd75443a77",
      profile_id: "e4060dc2-ce3d-49ad-bc2a-de55f1e9e333",
      nama_obat: "Amoxicillin",
      dosis_obat: "1 kapsul",
      sisa_obat: 10,
      status: "dosis diubah",
      waktu_minum: ["08:00", "14:00", "20:00"],
      created_at: "2025-07-23T09:15:35.428945",
    },
    {
      id: "5f8h9i5h-6g84-7962-d15d-7h32g089f917",
      user_id: "09432a55-60f5-4197-a44c-dddd75443a77",
      profile_id: "e4060dc2-ce3d-49ad-bc2a-de55f1e9e333",
      nama_obat: "Vitamin C",
      dosis_obat: "1 tablet",
      sisa_obat: 0,
      status: "stock habis",
      waktu_minum: ["10:00"],
      created_at: "2025-07-22T18:05:11.539056",
    },
    {
      id: "6g9i0j6i-7h95-8073-e26e-8i43h190g028",
      user_id: "09432a55-60f5-4197-a44c-dddd75443a77",
      profile_id: "e4060dc2-ce3d-49ad-bc2a-de55f1e9e333",
      nama_obat: "Vitamin D",
      dosis_obat: "1 tablet",
      sisa_obat: 5,
      status: "jadwal diubah",
      waktu_minum: ["09:00"],
      created_at: "2025-07-21T11:45:59.640167",
    },
  ];

  useEffect(() => {
    // Load history data
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const result = await getAllHistory();
      // Check if we got valid data from the API
      if (
        result &&
        result.success &&
        result.data &&
        Array.isArray(result.data)
      ) {
        setHistoryData(result.data);
      } else {
        console.warn(
          "No history data found or invalid format, using fallback data"
        );
        // Fallback to dummy data for development/testing
        setHistoryData(dummyHistoryData);
      }
    } catch (err) {
      console.error("Error loading history data:", err);
      setError("Gagal memuat data riwayat. Silakan coba lagi.");
      // Still set dummy data if there's an error for UI testing
      setHistoryData(dummyHistoryData);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Tidak tersedia";

    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("id-ID", options);
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6">
        {/* Header section with refresh button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Riwayat Penggunaan Obat
            </h1>
            <p className="text-gray-600 mt-1">
              Lihat catatan penggunaan obat Anda
            </p>
          </div>
          <button
            onClick={loadHistoryData}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memuat...
              </>
            ) : (
              <>
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-700">Memuat data...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main content - History Table */}
        {!isLoading && historyData.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tanggal
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nama Obat
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Dosis
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sisa Obat
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Waktu Minum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyData.map((history) => (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(history.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-1">
                          <div className="text-sm font-medium text-gray-900">
                            {history.nama_obat}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {history.dosis_obat}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {history.sisa_obat}{" "}
                      {history.sisa_obat > 0 ? "tablet" : "habis"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                          history.status === "diminum"
                            ? "bg-green-100 text-green-800"
                            : history.status === "tidak diminum"
                            ? "bg-red-100 text-red-800"
                            : history.status === "stock habis" ||
                              history.sisa_obat === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : history.status === "dosis diubah" ||
                              history.status === "jadwal diubah"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {history.status || "Tidak diketahui"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {history.waktu_minum && Array.isArray(history.waktu_minum)
                        ? history.waktu_minum.join(", ")
                        : history.waktu_minum || "Tidak ada"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !isLoading ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Tidak ada data riwayat
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada catatan riwayat penggunaan obat untuk ditampilkan.
            </p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default History;
