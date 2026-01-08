import React from "react";

const EmptyState = ({
  icon = "📋",
  title = "Belum Ada Data",
  description = "Mulai dengan menambahkan data pertama Anda",
  actionText = "Tambah Data",
  onAction,
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
        >
          <span className="mr-2">➕</span>
          {actionText}
        </button>
      )}
    </div>
  );
};

const WelcomeCard = () => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
      <div className="text-5xl mb-4">🌟</div>
      <h2 className="text-2xl font-bold mb-3">Selamat Datang di Ngompas!</h2>
      <p className="text-blue-100 mb-6 leading-relaxed">
        Platform digital untuk membantu Anda mengelola jadwal obat dan kontrol
        kesehatan dengan mudah dan terorganisir.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="text-2xl mb-2">💊</div>
          <h3 className="font-semibold mb-1">Jadwal Obat</h3>
          <p className="text-sm text-blue-100">Atur pengingat minum obat</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="text-2xl mb-2">🏥</div>
          <h3 className="font-semibold mb-1">Kontrol Dokter</h3>
          <p className="text-sm text-blue-100">Kelola jadwal pemeriksaan</p>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold mb-1">Riwayat</h3>
          <p className="text-sm text-blue-100">Pantau progress kesehatan</p>
        </div>
      </div>
    </div>
  );
};

export { EmptyState, WelcomeCard };
export default EmptyState;
