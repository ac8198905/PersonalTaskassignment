/**
 * LoadingState — full-width spinner with a configurable message.
 */
export default function LoadingState({ message = 'Loading your tasks...' }) {
  return (
    <div className="loading-state" id="loading-state">
      <div className="loading-state__spinner" />
      <p className="loading-state__text">{message}</p>
    </div>
  );
}
