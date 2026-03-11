import { usePVStore } from '../store';

export function EmptyState() {
  const { searchQuery, activeTag, activeSource } = usePVStore();
  const isFiltered = !!(searchQuery || activeTag || activeSource);
  return (
    <div className="pv-empty">
      <div className="pv-empty-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      </div>
      {isFiltered ? (
        <>
          <h3>No results found</h3>
          <p>Try adjusting your search or filters</p>
        </>
      ) : (
        <>
          <h3>Your vault is empty</h3>
          <p>Start sending prompts on any AI site — they'll be automatically saved here.</p>
        </>
      )}
    </div>
  );
}
