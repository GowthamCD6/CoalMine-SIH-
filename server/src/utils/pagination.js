export const parsePagination = (query, allowedSortFields = ['id', 'created_at', 'name', 'status']) => {
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) page = 1;

  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  let sort = query.sort || 'id';
  if (allowedSortFields && !allowedSortFields.includes(sort)) {
    sort = 'id';
  }

  let order = (query.order || 'ASC').toUpperCase();
  if (order !== 'ASC' && order !== 'DESC') {
    order = 'ASC';
  }

  return {
    page,
    limit,
    offset,
    sort,
    order,
  };
};

export const buildMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export default {
  parsePagination,
  buildMeta,
};
