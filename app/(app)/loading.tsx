export default function AppLoading() {
  return (
    <div className="page-shell page-loading" role="status">
      <div className="loading-line loading-title" />
      <div className="loading-stats">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="loading-card" key={index} />
        ))}
      </div>
      <span className="sr-only">Loading your learning workspace</span>
    </div>
  );
}
