/**
 * This class defines a player object each player
 * has an ID, a discord tag and a score.
 *
 * ID: the discord user ID
 * dicordTag: the nickname of a player
 * score: a players ELO 10 man score
 */
module.exports = class team
{
    constructor(players)
    {
        this.players = players;
    }

    getTeamScore()
    {
        let score = 0;
        this.players.forEach(player =>
        {
            score += parseInt(player.score);
        });
        return score;
    }

    printTeam()
    {
        let out = "(" + this.getTeamScore() + "):";
        this.players.forEach(player =>
        {
            out += " " + player.discordTag + " (" + player.score + ")"
        });
        return out;
    }

    getPlayers()
    {
        return this.players;
    }
};