import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRepos = () => {
    setLoading(true);
    setError(null);

    fetch("https://api.github.com/users/Manashvi04/repos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }

        return response.json();
      })

      .then((data) => {
        setRepos(data);
      })

      .catch((err) => {
        setError(err.message);
      })

      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRepos} />;
  }

  return (
    <div className="container">
      <h1>GitHub Repositories</h1>

      <input
        type="text"
        placeholder="Search Repository..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="repo-list">
        {repos

          .filter((repo) =>
            repo.name.toLowerCase().includes(search.toLowerCase()),
          )

          .map((repo) => (
            <div className="repo-card" key={repo.id}>
              <h2>{repo.name}</h2>

              <p>⭐ {repo.stargazers_count}</p>

              <a href={repo.html_url} target="_blank" rel="noreferrer">
                View Repository
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Projects;
