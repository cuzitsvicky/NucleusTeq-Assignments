/**
 * Pagination footer component.
 * Renders previous/next navigation buttons and a page counter
 * based on the paginated meta-information provided by the API.
 */
export default function Pagination({ pagination, loading, onPageChange }) {
  // Return nothing if there are no items or pages to display
  if (pagination.total === 0) return null;

  return (
    <div className="pagination">
      {/* Previous page navigation button */}
      <button
        type="button"
        disabled={!pagination.has_previous || loading}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </button>

      {/* Page indicator displaying current page against total pages count */}
      <span>
        Page {pagination.page} of {pagination.total_pages}
      </span>

      {/* Next page navigation button */}
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
