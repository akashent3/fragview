export default function LoadingPerfumes() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="h-20 w-2/3 mb-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}