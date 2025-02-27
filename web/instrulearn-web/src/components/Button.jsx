export default function Button({ children, onClick }) {
  return (
    <button
      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition duration-300"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
