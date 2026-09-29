import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [repos, setRepos] = useState([]);
  const [languageTotals, setLanguageTotals] = useState({});
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [repoError, setRepoError] = useState('');
  const [languageError, setLanguageError] = useState('');

  useEffect(() => {
    let ignoreResult = false;

    async function loadRepos() {
      try {
        const response = await fetch(
          'https://api.github.com/users/themostdigital50-web/repos'
        );

        if (!response.ok) {
          throw new Error(`GitHub returned ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error(data.message || 'GitHub returned an unexpected response');
        }

        if (!ignoreResult) {
          setRepos(data);
          setIsLoadingLanguages(data.length > 0);
        }
      } catch (error) {
        if (!ignoreResult) setRepoError(error.message);
      } finally {
        if (!ignoreResult) setIsLoadingRepos(false);
      }
    }

    loadRepos();

    return () => {
      ignoreResult = true;
    };
  }, []);

  useEffect(() => {
    if (repos.length === 0) return;
    let ignoreResult = false;

    async function loadLanguages() {
      const results = await Promise.all(
        repos.map(async (repo) => {
          const response = await fetch(
            `https://api.github.com/repos/${repo.full_name}/languages`
          );

          if (!response.ok) {
            throw new Error(`Could not retrieve languages for ${repo.name}`);
          }

          return response.json();
        })
      );

      const totals = {};

      for (const languages of results) {
        for (const [language, bytes] of Object.entries(languages)) {
          totals[language] = (totals[language] ?? 0) + bytes;
        }
      }

      if (!ignoreResult) setLanguageTotals(totals);
    }

    loadLanguages()
      .catch((error) => {
        if (!ignoreResult) setLanguageError(error.message);
      })
      .finally(() => {
        if (!ignoreResult) setIsLoadingLanguages(false);
      });

    return () => {
      ignoreResult = true;
    };
  }, [repos]);

  const languages = Object.entries(languageTotals).sort(
    ([, firstBytes], [, secondBytes]) => secondBytes - firstBytes
  );
  return (
    <main className="App">
      <header className="page-header">
        <p className="eyebrow">Developer portfolio</p>
        <h1>Hello, Dabes</h1>
        <p>Software Developer</p>
      </header>

      <div className="content-grid">
        <section aria-labelledby="repos-title">
          <div className="section-heading">
            <h2 id="repos-title">All Repositories</h2>
            <span>{`${repos.length} total`}</span>
          </div>

          {repoError ? (
            <p className="message error" role="alert">Could not load repositories: {repoError}</p>
          ) : isLoadingRepos ? (
            <p className="message">Loading repositories from GitHub...</p>
          ) : (
            <div className="repo-grid">
              {repos.map((repo) => (
                <article className="repo-card" key={repo.id}>
                  <p className="repo-language">{repo.language || 'Language not detected'}</p>
                  <h3>{repo.name}</h3>
                  <p className="repo-description">
                    {repo.description || 'No description provided.'}
                  </p>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    View on GitHub <span aria-hidden="true">↗</span>
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="languages-section" aria-labelledby="languages-title">
          <div className="section-heading">
            <h2 id="languages-title">Languages used</h2>
          </div>
          {languageError ? (
            <p className="message error" role="alert">Could not load languages: {languageError}</p>
          ) : isLoadingLanguages ? (
            <p className="message">Loading languages...</p>
          ) : languages.length === 0 ? (
            <p className="message">Language data will appear here.</p>
          ) : (
            <ul className="language-list">
              {languages.map(([language, bytes]) => (
                <li key={language}>
                  <span>{language}</span>
                  <span>{(bytes / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
