const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

require('dotenv').config();

async function f(url){
	const repo = await fetch(url);
	if (!repo.ok) {
		return await interaction.reply({ content: 'Erro ao buscar informações do Kuken.', ephemeral: true });
	}
	const data = await repo.json();
	return data;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kuken')
		.setDescription('Mostra informações do repositório no GitHub'),
	async execute(interaction) {
		const repo = await f(`https://api.github.com/repos/${process.env.GITHUB_REPO}`);
		const latestCommit = await f(`https://api.github.com/repos/${process.env.GITHUB_REPO}/commits/main`);

		if (!repo || !latestCommit) {
			return await interaction.reply({ content: 'Erro ao buscar informações do Kuken.', ephemeral: true });
		}

		const commitMessage = latestCommit.commit.message;
		const commitAuthor = latestCommit.commit.author.name;
		const commitDate = latestCommit.commit.author.date.replace('T', ' ').replace('Z', '');
		const commitUrl = latestCommit.html_url;

		const embed = new EmbedBuilder()
			.setTitle('📦 Repositório: ' + repo.full_name)
			.setURL(repo.html_url)
			.setDescription(repo.description)
			.setColor(0x2b3137)
			.addFields(
				{ name: '🌟 Stars', value: String(repo.stargazers_count), inline: true },
				{ name: '🍴 Forks', value: String(repo.forks_count), inline: true },
				{ name: '🐛 Issues Abertas', value: String(repo.open_issues), inline: true },
				{ 
					name: '🕐 Último Commit', 
					value: `**${commitMessage}**\nAutor: ${commitAuthor}\nData: ${commitDate}\n[🔗 Ver commit](${commitUrl})`, 
					inline: false 
				}
			)
			.setFooter({ text: 'GitHub • Atualizado agora', iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' })
			.setThumbnail(repo.owner.avatar_url);

		await interaction.reply({ embeds: [embed] });
	},
};
