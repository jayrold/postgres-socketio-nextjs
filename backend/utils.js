/**
 * Checks if the data matches the provided filters
 * @param {Object} data - The data to check against filters
 * @param {Object} filters - The filters to apply
 * @returns {boolean} - Whether the data matches the filters
 */
export function checkFilters(data, filters) {
  // Handle OR conditions
  if (filters.or) {
    return filters.or.some(condition => {
      return Object.entries(condition).every(([key, value]) => {
        return data[key] === value;
      });
    });
  }

  // Handle AND conditions
  if (filters.and) {
    return filters.and.every(condition => {
      return Object.entries(condition).every(([key, value]) => {
        return data[key] === value;
      });
    });
  }

  // Handle simple equality conditions
  return Object.entries(filters).every(([key, value]) => {
    return data[key] === value;
  });
}