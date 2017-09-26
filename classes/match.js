/**
 * This class defines a match object.
 * Each match contains 2 teams of 5 players
 *
 * ID: the discord user ID
 * dicordTag: the nickname of a player
 * score: a players ELO 10 man score
 */
module.exports = class match
{
    constructor(team1, team2)
    {
        this.team1 = team1;
        this.team2 = team2;
    }

    getDelta()
    {
        return Math.abs(this.team1.getTeamScore() - this.team2.getTeamScore());
    }

    getTeam1()
    {
        return this.team1;
    }
    getTeam2()
    {
        return this.team2;
    }
};