export default function LoadingBrands() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-60 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}