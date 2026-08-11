/**
 * FilterBar — pill-shaped filter buttons + sort dropdown.
 * Matches the reference: Filter: [All] [Todo] [In Progress] [Done]  Sort: [Due Date ↑↓]
 */

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function FilterBar({ status, sortBy, order, onStatusChange, onSortChange }) {
  const handleSortByChange = (e) => {
    const newSortBy = e.target.value;
    onSortChange(newSortBy, newSortBy ? (order || 'desc') : '');
  };

  const handleOrderChange = (e) => {
    onSortChange(sortBy, e.target.value);
  };

  return (
    <div className="filter-bar" id="filter-bar">
      {/* Status filter */}
      <div className="filter-bar__group">
        <span className="filter-bar__label">Filter:</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            id={`filter-${f.value || 'all'}`}
            className={`btn btn--small ${
              status === f.value ? 'btn--filter-active' : 'btn--secondary'
            }`}
            onClick={() => onStatusChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort controls */}
      <div className="filter-bar__group">
        <span className="filter-bar__label">Sort:</span>
        <select
          id="sort-by-select"
          className="sort-select"
          value={sortBy}
          onChange={handleSortByChange}
        >
          <option value="">Default</option>
          <option value="dueDate">Due Date ↑↓</option>
          <option value="priority">Priority ↑↓</option>
          <option value="createdAt">Created ↑↓</option>
        </select>

        {sortBy && (
          <select
            id="sort-order-select"
            className="sort-select"
            value={order}
            onChange={handleOrderChange}
          >
            <option value="desc">
              {sortBy === 'priority' ? 'High → Low' : 'Newest'}
            </option>
            <option value="asc">
              {sortBy === 'priority' ? 'Low → High' : 'Oldest'}
            </option>
          </select>
        )}
      </div>
    </div>
  );
}
