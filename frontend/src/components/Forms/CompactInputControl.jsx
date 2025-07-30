const CompactInputControl = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  icon = "📝",
}) => (
  <div className="mb-4">
    <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
      <span className="mr-2">{icon}</span>
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
          error
            ? "border-red-400 focus:border-red-500 bg-red-50 pr-12"
            : "border-gray-300 focus:border-blue-400 hover:border-gray-400 bg-white"
        }`}
      />
      {error && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <span className="text-red-500 text-lg">⚠️</span>
        </div>
      )}
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-2 flex items-center">
        <span className="mr-1">❌</span>
        {error}
      </p>
    )}
  </div>
);

export default CompactInputControl;
