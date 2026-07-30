function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error">
      <h2>Something went wrong!</h2>

      <p>{message}</p>

      <button onClick={onRetry}>Retry</button>
    </div>
  );
}

export default ErrorMessage;
