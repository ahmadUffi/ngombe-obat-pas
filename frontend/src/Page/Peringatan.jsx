import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout/Layout";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import EmptyState from "../components/UI/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { apiService } from "../api/apiservice";
import { toast } from "react-toastify";
import { AlertTriangle, Search } from "lucide-react";

const Peringatan = () => {
  const { token } = useAuth();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllWarnings(token);
      setWarnings(res?.data ?? []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
      toast.error("Gagal memuat peringatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    if (!searchTerm) return warnings;
    const q = searchTerm.toLowerCase();
    return warnings.filter((w) => {
      const fields = [
        w?.pesan,
        w?.nama_obat,
        w?.slot_obat ? `slot ${w.slot_obat}` : "",
      ];
      return fields.some((f) =>
        String(f || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [warnings, searchTerm]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    );
  }, [filtered]);

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  // Map slot badge color by slot A-F
  const getSlotClasses = (slot) => {
    const s = String(slot || "").toUpperCase();
    switch (s) {
      case "A":
        return "bg-red-100 text-red-700 border-red-200";
      case "B":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "C":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "D":
        return "bg-green-100 text-green-700 border-green-200";
      case "E":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "F":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 space-y-6">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
              <AlertTriangle size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Peringatan
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Daftar peringatan terkait aktivitas slot obat Anda.
            </p>

            {!loading && (
              <button
                onClick={fetchWarnings}
                className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                title="Muat ulang"
              >
                <span className="mr-2">🔄</span>
                Refresh Data
              </button>
            )}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari pesan, nama obat, atau slot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-400"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (sorted?.length ?? 0) === 0 ? (
            <EmptyState
              icon="⚠️"
              title="Belum Ada Peringatan"
              description="Peringatan akan tampil di sini saat ada aktivitas terkait slot obat."
            />
          ) : (
            <div className="space-y-3 flex flex-wrap gap-3">
              {sorted.map((w) => (
                <div
                  key={w.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition w-[350px] "
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className="h-9 w-9 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <AlertTriangle size={18} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">
                          {w.pesan || "Peringatan"}
                        </span>
                        {w.slot_obat && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border ${getSlotClasses(
                              w.slot_obat
                            )}`}
                          >
                            Slot {String(w.slot_obat).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">
                          {w.nama_obat || "-"}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {formatDate(w.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Peringatan;
