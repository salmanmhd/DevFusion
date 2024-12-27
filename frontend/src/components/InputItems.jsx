export default function InputItems({
  value,
  setValue,
  labelText,
  placeholderText,
  type,
}) {
  return (
    <div>
      <label
        htmlFor="email"
        className="mb-2 block text-sm font-medium text-gray-200"
      >
        {labelText}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-500"
        placeholder={placeholderText}
        required
      />
    </div>
  );
}
