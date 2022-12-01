import { request } from "@octokit/request";


interface Commit {
    Date, Title, URL, SHA
}
class RepoStats {
	latestCommit : Commit | null = null;

	async GetStats() : Promise<Commit | null>
	{
		let commit :Commit | null = null;
		const res = await request('GET /repos/{owner}/{repo}/commits{?sha,path,author,since,until,per_page,page}', {
			headers: {
				authorization: process.env.GITHUB_AUTH
			},
			owner: 'BryceStandley',
			repo: 'CostaBarcodes'
		})
		if(res.status === 200)
		{
			if(res.data.length > 0)
			{
				const gh = res.data[0]; // latest commit from repo
				const date = gh.commit.author.date.substring(0, 10);
				const title = gh.commit.message.substring(0, gh.commit.message.indexOf('\n\n'));
				const url = gh.html_url;
				const sha = gh.sha.substring(0, 7);
				commit = {Date: date, Title: title, URL: url, SHA: sha};
			}
		}
		else
		{
			commit = {Date: 'Unknown', Title: '0.0.0', URL: 'https://github.com/brycestandley/costabarcodes', SHA: 'NONE'}
		}
		
		return commit;
	}

	async LoadStats()
	{
		const commit = await this.GetStats();
		this.latestCommit = commit;
	}

}

const latestRepoStats = new RepoStats();
export default latestRepoStats;
export { RepoStats, Commit }