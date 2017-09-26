/**
 * This class defines a player object each player
 * has an ID, a discord tag and a score.
 *
 * ID: the discord user ID
 * dicordTag: the nickname of a player
 * score: a players ELO 10 man score
 */
module.exports = class player
{
    constructor(id, discordTag, score)
    {
        this.id = id;
        this.discordTag = discordTag;
        this.score = score;
        this.vote = 0;
    }

    getID()
    {
        return this.id;
    }

    getDiscordTag()
    {
        return this.discordTag;
    }

    getPlayerScore()
    {
        return this.score;
    }

    setPlayerScore(score)
    {
        this.score = score;
    }

    setVote(teamNum)
    {
        this.vote = teamNum;
    }

    getVote()
    {
        return this.vote;
    }

};