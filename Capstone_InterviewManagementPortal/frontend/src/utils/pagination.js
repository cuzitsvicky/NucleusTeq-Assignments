/**
 * Default pagination state template for lists (jobs, candidates, users, etc.).
 */
export const emptyPagination = {
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false
};

/**
 * Extracts and maps pagination fields from an API response structure
 * into a standard format used by frontend list components.
 */
export function paginationFrom(response) {
  return {
    page: response.page,
    limit: response.limit,
    total: response.total,
    total_pages: response.total_pages,
    has_next: response.has_next,
    has_previous: response.has_previous
  };
}
