export default function Pagination({ pagination, loading, onPageChange }) {
  if (pagination.total === 0) return null;

  return (
    <div className="pagination">
      <button
        type="button"
        disabled={!pagination.has_previous || loading}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </button>
      <span>
        Page {pagination.page} of {pagination.total_pages}
      </span>
      <button
        type="button"
        disabled={!pagination.has_next || loading}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Next
      </button>
    </div>
  );
}
