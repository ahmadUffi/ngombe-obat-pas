const AllSlotsFullWarning = () => (
  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl shadow-sm">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-xl">🚫</span>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-red-800 font-bold text-lg mb-1">
          Semua Slot Obat Penuh!
        </h4>
        <p className="text-red-700 text-sm leading-relaxed mb-3">
          Tidak dapat menambah obat baru karena semua 8 slot sudah terisi. Untuk
          menambah obat baru, Anda perlu menghapus salah satu jadwal obat yang
          sudah ada terlebih dahulu.
        </p>
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full font-medium">
            8/8 Slot Terpakai
          </span>
          <span className="text-red-600">
            💡 Hapus obat yang tidak diperlukan untuk membebaskan slot
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default AllSlotsFullWarning;
