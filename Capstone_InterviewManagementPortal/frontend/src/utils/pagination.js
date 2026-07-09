export const emptyPagination = {
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false
};

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
