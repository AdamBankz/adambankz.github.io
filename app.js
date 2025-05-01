function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'b';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

(async function () {
  const colours = {
    'JavaScript': '#f1e05a',
    'C#': '#178600',
    'Python': '#3572A5',
    'Lua': '#000080'
  };

  fetch(`https://api.github.com/users/adambankz/repos?sort=created&direction=desc`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Now ensure we do not filter out everything
      data.forEach(repo => {
        // Exclude the personal profile repo `adambankz/adambankz`
        if (repo.name === 'adambankz') return;

        // Exclude profile repos or any `.github.io` repos
        if (
          repo.name === repo.owner.login || // Exclude repos where name is the same as the owner (e.g., your username)
          repo.name.endsWith('.github.io') || // Exclude ".github.io" repos (usually profile pages)
          (repo.description && repo.description.includes(".github.io")) // Exclude repos with description mentioning ".github.io"
        ) return;

        const repoData = {
          url: repo.html_url,
          name: repo.name.replaceAll(/-(?!\d)/g, ' '),
          description: (repo.description || "No description").split(":")[0],
          coding: {
            language: repo.language,
            colour: colours[repo.language] || '#000000' // Default to black if no colour is found
          },
          stars: {
            url: repo.stargazers_url.replace('api.', '').replace('/repos', ''),
            count: repo.stargazers_count
          },
          forks: {
            url: repo.forks_url.replace('api.', '').replace('/repos', ''),
            count: repo.forks_count
          }
        };

        let newRepo = document.getElementsByClassName('git-repo-example')[0].cloneNode(true);
        newRepo.setAttribute('style', "visibility: visible; position: inherit;");
        newRepo.getElementsByClassName('repo-title')[0].innerHTML = repoData.name;
        newRepo.getElementsByClassName('repo-desc')[0].innerHTML = `${repoData.description}`;
        newRepo.getElementsByClassName('repo-lang')[0].innerHTML = repoData.coding.language;
        newRepo.getElementsByClassName('repo-star-count')[0].innerHTML = formatNumber(parseInt(repoData.stars.count, 10));
        newRepo.getElementsByClassName('repo-stars')[0].href = repoData.stars.url;
        newRepo.getElementsByClassName('repo-fork-count')[0].innerHTML = formatNumber(parseInt(repoData.forks.count, 10));
        newRepo.getElementsByClassName('repo-forks')[0].href = repoData.forks.url;
        newRepo.getElementsByClassName('repo-code')[0].setAttribute('style', `fill: ${repoData.coding.colour};`);
        newRepo.getElementsByClassName('repo-url')[0].href = repoData.url;

        // Check if it's an npm package, and handle the downloads
        if (repo.name.toLowerCase().includes("npm-package")) {
          newRepo.getElementsByClassName('npm-downloads')[0].setAttribute('style', "visibility: visible; position: inherit;");
          fetch(`https://api.npmjs.org/downloads/point/last-year/${repo.name.toLowerCase().split("-npm-package")[0]}`).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            newRepo.getElementsByClassName('npm-download-count')[0].innerHTML = formatNumber(parseInt(data.downloads, 10));
            newRepo.getElementsByClassName("npm-downloads")[0].href = `https://www.npmjs.com/package/${repo.name.toLowerCase().split("-npm-package")[0]}`;
          });
          document.getElementsByClassName("npms")[0].append(newRepo);
        } else {
          document.getElementsByClassName("repos")[0].append(newRepo);
        }
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
})();
