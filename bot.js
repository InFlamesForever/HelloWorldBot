
//import npm libraries
//********************************************************************************************************
const Discord = require('discord.js'); // npm install discord.js --save
const moment = require('moment'); // npm install moment --save
const sleep = require('system-sleep'); // npm install system-sleep --save
const vision = require('node-cloud-vision-api'); // npm install node-cloud-vision-api --save

//import local config files
//********************************************************************************************************
const botSettings = require('./botSettings.json');
const tokens = require('./tokens.json');
const authentication = require("./authentication");
const botFunctions = require("./botFunctions.js");

const Player = require('./classes/player');
const Team = require('./classes/team');
const Match = require('./classes/match');


//get bot settings e.g. token, prefix, etc and assign to local variables
//********************************************************************************************************
const botToken = tokens.token;
const botAPIKey = tokens.API_KEY;
const botPrefix = botSettings.prefix;
const botAnnounceCooldown = botSettings.announceCooldown;
const debug = botSettings.debug;

const setupChannelName = botSettings.SetupChannel;
const team1ChannelName = botSettings.Team1Channel;
const team2ChannelName = botSettings.Team2Channel;
const PlayersRequiredToMatchmake = botSettings.PlayersRequiredToMatchmake;

const votingTimout = botSettings.voteTimeout;

let lastAnnouncementMade; //for Richard to use for cooldown thingy
let matches = [];
let chosenMatch;
let votingStarted = false;

let playersArr = [];


// Initialize Discord Bot
//********************************************************************************************************
var bot = new Discord.Client({});

// When bot is ready, execute this code
//********************************************************************************************************
bot.on
('ready', () =>
    {
        if (debug)
        {
            console.log('Logging in ...');
            console.log('Logged in as: ' + bot.user.tag + ' - (' + bot.user.id + ')'); //This will display the name in package.name and it's registered Discord ClientID
        }
    }
);

// Bot is now listening in for certain commands from the discord user e.g. !Ping
//********************************************************************************************************
bot.on
('message', msg =>
    {
        //reject the following input and exit
        if(msg.author.bot) return; //if the bot is the one sending the message exit this code block.
        if(msg.channel.type === 'dm') return; //if the bot recieves a private / direct message, ignore it and exit this code block.

        if (msg.content.substring(0, 1) === botPrefix) //if the first string is a !, continue...
        {
            //Stripper - this code block will take the entire user input !UploadScore 3, 7 or !MakeTeams and then strip it into a command variable=MakeTeams and param1 =3, param2=7, etc....
            let args = msg.content.slice(botPrefix.length).trim().split(/ +/g); //this will remove the prefix and then load the contents into an array
            let command = args.shift().toUpperCase(); //This will remove (aka shift) the first element of the array. It will assign the command variable with a value of UploadScore,  MakeTeams, etc.
            let param1 = args[0]; //the array args will now only contain the parameters (if any), so lets assign those to local variables too. i.e. param1=3, param2=7 and if there was a param3, param3=undefined
            let param2 = args[1];
            let param3 = args[2];

            //Start of command
            //********************************************************************************************************
            if (command === 'HELP')
            {
                msg.reply('');
                msg.channel.send({embed:
                    {
                        color: 3447003,
                        author: {
                            name: bot.user.username,
                            icon_url: bot.user.avatarURL
                        },
                        title: '__To join 10 Mans__',
                        //url: 'http://google.com',
                        description: 'Simply join the **' + setupChannelName+ '** voice channel on the left to queue.' ,
                        fields:
                            [
                                {
                                    name: '__Commands__',
                                    value: 'All commands are non case sensitive so you can type !Help or !help or !HELP.'
                                },
                                {
                                    name: '!Everyone',
                                    value: 'Bot broadcasts message to everyone with # of players required. Can only be executed once every 60 seconds (tbc).'
                                },
                                {
                                    name: '!MakeTeams',
                                    value: 'Bot generates 5 balanced teams once there are ' + PlayersRequiredToMatchmake + ' players in the **' + setupChannelName + '** voice channel. If there are dropouts AFTER the command is executed, simply execute again to make teams using the latest 10 mans.'
                                },
                                {
                                    name: '!Vote <Result #>',
                                    value: 'Vote for your preferred team from the match making results, you can only vote once so vote wisely. e.g. !Vote 5'
                                },
                                {
                                    name: '!OverrideTeamVote <Result #>',
                                    value: 'A mod can override the vote in case no one votes or people troll - TBC. Not sure if this is required. e.g. !OverrideTeamVote 2'
                                },
                                {
                                    name: '!SplitTeams',
                                    value: 'Moves all users in **' + setupChannelName+ '** to **' + team1ChannelName + '** / **' + team2ChannelName + '** voice channels when you are ready to start the match.'
                                },
                                {
                                    name: '!MergeTeams',
                                    value: 'Merges all users in **' + team1ChannelName + '** / **' + team2ChannelName + '** back to **' + setupChannelName+ '** voice channel. Do this once match has ended. Can only be executed by those that have just finished playing'
                                },
                                {
                                    name: '!UploadScore <COG Score Swarm Score>',
                                    value: 'Scores must be numbers between 0-7. One of the numbers must be 7. Both number cannot be 7. e.g. !UploadScore 6 7'
                                },
                                {
                                    name: '!UploadScreenshot <URL of PNG>',
                                    value: 'Take screenshot of final scores, paste into #scoreboards, copy URL of PNG, use URL as argument e.g. !UploadScreenshot https://cdn.discordapp.com/attachments/7/3/unknown.png'
                                }
                            ],
                        timestamp: new Date(),
                        footer: {
                            icon_url: bot.user.avatarURL,
                            text: '© The above is work in progress. Contact BROADBANNED for feedback.'
                        }
                    }
                });

            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'PING')
            {
                msg.reply('Pong!');
                msg.reply('Command=' + command + ' param1=' + param1 + ' param2=' + param2 + ' param3=' + param3);
                //msg.reply(`Hello ${msg.author.username}, I see you're a ${args[0]} year old ${sex} from ${location}. Wanna date?`);
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'EVERYONE')
            {
                //Checks if the last announcement was made long enough ago, if not no announcement is made
                let diff;
                let atEveryone;
                if(lastAnnouncementMade !== undefined)
                {
                    diff = timeSinceLastAnnouncement(lastAnnouncementMade);
                    atEveryone = diff >= botAnnounceCooldown;
                }
                else
                {
                    atEveryone = true;
                }

                if(atEveryone)
                {
                    //get number of players in 10 Man Setup voice channel and then minus it from 10. Show this value in the output.
                    let players = getPlayersFromSetupChannel();

                    if(players.length >= PlayersRequiredToMatchmake)
                    {
                        msg.channel.send('' + setupChannelName+ ' is full. You can not use this command.');
                    }
                    else
                    {
                        //Announce a message to @everyone
                        msg.channel.send('@everyone We need '+ (PlayersRequiredToMatchmake-players.length) +' more players, please join the ' + setupChannelName+ ' voice channel. Thanks ' + msg.author.username);

                        lastAnnouncementMade = moment();
                    }
                }
                else
                {
                    msg.reply('You can not use this command for another ' + (botAnnounceCooldown-diff) + ' seconds.');
                }
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'MAKETEAMS')
            {
                //will be an async command
                //count number of players in the setup voice channel

                let players = getPlayersFromSetupChannel();

                if(players.length <PlayersRequiredToMatchmake)
                {
                    msg.reply('\nNot enough players in **' + setupChannelName+ '** voice channel. \nWait for ' + (PlayersRequiredToMatchmake-players.length) + ' more to join and then !MakeTeams.');
                    return;
                }
                else if (players.length >PlayersRequiredToMatchmake)
                {
                    msg.reply('\nToo many players in **' + setupChannelName+ '** voice channel. \nWait for ' + (players.length-PlayersRequiredToMatchmake) + ' more to leave and then !MakeTeams.');
                    return;
                }
                //get all 10 players from 10 Man Setup voice channel

                let playerIds = playersToIds(players);

                //push players as parameter into google api
                authentication.authenticate().then((auth)=>
                {
                    botFunctions.sendPlayerIDsToGoogleSheets(auth, playerIds);
                });


                //wait for something
                sleep(1*1000); // sleep for 2 seconds



                //call google api and get balanced teams to  outut to discord text channel
                let rows;
                authentication.authenticate().then(async (auth)=>
                {
                    let out = '';
                    rows = await botFunctions.fetchTeamsOutput(auth);
                    for (let i = 0; i < rows.length; i++)
                    {
                        let row = rows[i];
                        out += row.join(", ") + '\n';
                    }
                    msg.channel.send(out);
                });


                sleep(1*1000); // sleep for 1 seconds

                let player0 = new Player(players[0].user.id, players[0].nickname, 0);
                let player1 = new Player(players[1].user.id, players[1].nickname, 0);
                let player2 = new Player(players[2].user.id, players[2].nickname, 0);
                let player3 = new Player(players[3].user.id, players[3].nickname, 0);
                let player4 = new Player(players[4].user.id, players[4].nickname, 0);
                let player5 = new Player(players[5].user.id, players[5].nickname, 0);
                let player6 = new Player(players[6].user.id, players[6].nickname, 0);
                let player7 = new Player(players[7].user.id, players[7].nickname, 0);
                let player8 = new Player(players[8].user.id, players[8].nickname, 0);
                let player9 = new Player(players[9].user.id, players[9].nickname, 0);

                playersArr = [];
                matches = [];
                chosenMatch = undefined;

                playersArr.push(player0);
                playersArr.push(player1);
                playersArr.push(player2);
                playersArr.push(player3);
                playersArr.push(player4);
                playersArr.push(player5);
                playersArr.push(player6);
                playersArr.push(player7);
                playersArr.push(player8);
                playersArr.push(player9);

                //call google api and get balanced teams array conataining UIDs to  process split teams, voting, etc
                authentication.authenticate().then(async (auth)=>
                {
                    rows = await botFunctions.fetchTeamsArray(auth);

                    for (let i = 0; i < rows.length; i++)
                    {
                        let row = rows[i];

                        let team1 = new Team(findPlayerInArr(row[0], playersArr),
                            findPlayerInArr(row[1], playersArr),
                            findPlayerInArr(row[2], playersArr),
                            findPlayerInArr(row[3], playersArr),
                            findPlayerInArr(row[4], playersArr));

                        let team2 = new Team(findPlayerInArr(row[10], playersArr),
                            findPlayerInArr(row[11], playersArr),
                            findPlayerInArr(row[12], playersArr),
                            findPlayerInArr(row[13], playersArr),
                            findPlayerInArr(row[14], playersArr));

                        matches.push(new Match(team1, team2));
                    }
                });

                votingStarted = true;

                msg.channel.send('Voting has started, please vote for your preferred team within the next '+ votingTimout/1000 + ' seconds.');

                setTimeout(function () {
                    msg.channel.send(finishVoting());
                }, votingTimout);
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'VOTE')
            {
                if(votingStarted === undefined)
                {
                    msg.reply('Voting has not started yet.');
                    return;
                }
                //validation rules
                if(param1>=1 && param1<=5) //param1 must be between 1-5 else reply with error message.
                {
                    //now see if they eligible to vote
                    //some code will go here

                    let votingPlayer = findPlayerInArr(msg.author.id, playersArr);
                    if(votingPlayer !== undefined)
                    {
                        votingPlayer.setVote(param1);
                        msg.reply('SUCCESS: You voted for result number: ' + param1); //Success message displayed
                    }
                    else
                    {
                        msg.reply('ERROR: You\'re not in the match and cannot vote'); //Player isn't in the match
                    }

                    //increment vote count for that team results
                    //some code will go here
                }
                else
                {
                    msg.reply('ERROR: Please enter a number between 1 and 5 e.g. !VoteForTeam 5');
                }
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'OVERRIDETEAMVOTE')
            {
                //validation rules
                if(param1>=1 && param1<=5) //param1 must be between 1-5 else reply with error message.
                {
                    //now see if they eligible to override
                    //some code will go here


                    msg.reply('SUCCESS: You overrode voting and forced result number: =' + param1);//Success message displayed

                    //increment vote count for that team results
                    //some code will go here
                }
                else
                {
                    msg.reply('ERROR: Please enter a number between 1 and 5 e.g. !OverrideTeamVote 5');
                }
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'SPLITTEAMS')
            {
                //Permissions for bot to move players is required for this command
                //get COG team players and move them to COG Team voice channel
                //some code here

                //get Swarm team players and move them to Swarm Team voice channel
                //some code here

                if(chosenMatch === undefined)
                {
                    msg.reply('Please finish voting/make new teams');
                    return;
                }

                let players = getPlayersFromSetupChannel();

                let team1Arr = [];
                let team2Arr = [];

                chosenMatch.getTeam1().getPlayers().forEach(player =>
                {
                    let found = findGuildMemberInArray(players, player.getID());
                    if(found !== undefined)
                    {
                        team1Arr.push(found);
                    }
                });

                chosenMatch.getTeam2().getPlayers().forEach(player =>
                {
                    let found = findGuildMemberInArray(players, player.getID());
                    if(found !== undefined)
                    {
                        team2Arr.push(found);
                    }
                });


                splitTeams(team1Arr, team2Arr);
                msg.reply('Moves all users in **10 Man Setup** to **COG Team** / **Swarm Team** voice channels when you are ready to start the match.');
                msg.reply('Command=' + command + ' param1=' + param1 + ' param2=' + param2 + ' param3=' + param3);
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'MERGETEAMS')
            {
                //move players from COG team voice channel to 10 Man Setup voice channel
                //some code here

                //move players from Swarm team voice channel to 10 Man Setup voice channel
                //some code here

                //is player allowed to use this command? i.e. he is 1 of the 10, or he needs to be a mod / admin.

                let channel = getChannel(setupChannelName);

                let players = getPlayersFromTeam1and2Channel();

                if(channel !== undefined)
                {
                    players.forEach(function (p) {
                        p.setVoiceChannel(channel);
                    });
                }
                msg.reply('Merge complete. All players are now back in **' + setupChannelName+ '** voice channel.');
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'UPLOADSCORE')
            {
                //validation rules
                if(
                    (param1) >= 0 &&
                    (param1) <= 7 &&
                    (param2) >= 0 &&
                    (param2) <= 7 &&
                    (param1 != param2) &&
                    (param1==7 || param2 ==7)
                ) //param1 and param2 must both be between 0-7 else reply with error message.
                {
                    //now see if they eligible to override
                    //some code will go here


                    msg.reply('SUCCESS: You uploaded the following score. COG:' + param1 + ' Swarm:' + param2); //Success message displayed

                    //increment vote count for that team results
                    //some code will go here
                }
                else
                {
                    msg.reply('ERROR: Please enter a valid COG and Swarm scores between 0 and 7 e.g. !UploadScore 3 7');
                }
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'UPLOADSCREENSHOT')
            {
                //initialise the vision api
                vision.init({auth: botAPIKey});

                //hardcode the param1 for now to save us typing it in each time - DELETE THIS ONCE IT WORKS
                if (param1 === 'undefined')
                {
                    param1 = 'https://cdn.discordapp.com/attachments/347947677687873546/357726016560562176/unknown.png';
                }


                //create the request
                const req = new vision.Request(
                    {
                        image: new vision.Image({
                            url: param1
                        }),
                        features: [
                            new vision.Feature('DOCUMENT_TEXT_DETECTION', 1),
                        ]
                    });

                //should async this asap - broadbanned
                // send single request
                vision.annotate(req).then(async (res) => {
                    // handling response
                    let out = await res.responses;
                    console.log(out[0].textAnnotations);
                    msg.channel.send(out[0].textAnnotations[0].description);
                }, (e) => {
                    console.log('Error: ', e)
                });

                msg.reply('Take screenshot of final scores, paste into #scoreboards, copy URL of PNG, use URL as argument e.g. !UploadScreenshot https://cdn.discordapp.com/attachments/7/3/unknown.png');
                msg.reply('Command=' + command + ' param1=' + param1 + ' param2=' + param2 + ' param3=' + param3);
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'PLACEHOLDER1')
            {
                msg.reply('Command=' + command + ' param1=' + param1 + ' param2=' + param2 + ' param3=' + param3);
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'PLACEHOLDER2')
            {
                msg.reply('Command=' + command + ' param1=' + param1 + ' param2=' + param2 + ' param3=' + param3);
            }
            //********************************************************************************************************
            //End of command

            //Start of command
            //********************************************************************************************************
            else if (command === 'PLACEHOLDER3')
            {
                msg.reply('Command=' + command + ' param1=' + param1 + ' param2=' + param2 + ' param3=' + param3);
            }
            //********************************************************************************************************
            //End of command

        }
    }
);

//Start of functions
//********************************************************************************************************
/**
 * Creates an array of GuildMember objects from
 * the team setup channel
 * @returns {Array} an array of GuildMember objects
 */
function getPlayersFromSetupChannel()
{
    let channel = getChannel(setupChannelName);

    let players = [];
    if(channel !== undefined)
    {
        channel.members.forEach(function (p) {
            players.push(p);
        });
        return players;
    }
    return [];
}

/**
 * Creates an array of GuildMember objects from the
 * team 1 and team 2 voice channels
 * @returns {Array} an array of GuildMember objects
 */
function getPlayersFromTeam1and2Channel()
{
    let channelTeam1 = getChannel(team1ChannelName);
    let channelTeam2 = getChannel(team2ChannelName);

    let players = [];
    if(channelTeam1 !== undefined)
    {
        channelTeam1.members.forEach(function (p) {
            players.push(p);
        });
    }
    if(channelTeam2 !== undefined)
    {
        channelTeam2.members.forEach(function (p) {
            players.push(p);
        });
    }
    return players;
}

/**
 * gets a Discord channel by name
 * @param channelName the name of the channel
 * @returns {*} the Discord channel object
 */
function getChannel(channelName)
{
    let channel;
    bot.channels.array().forEach(function (c) {
        if(c.name.toUpperCase() === channelName.toUpperCase())
        {
            channel = c;
        }
    });
    return channel;
}

/**
 * Takes an array of GuildMember objects and outputs an
 * array of user names
 * @param players an array of GuildMember objects
 * @returns {*} an array of user names
 */
function playersToUsername(players)
{
    let usernameArr;
    players.forEach(function (p) {
        usernameArr.push([p.user.username]);
    });
    return usernameArr;
}

/**
 * Takes an array of Guild Member objects and outputs
 * an array if their ID's as strings
 * @param players an array of GuildMember objects
 * @returns {*} an array of player ID's as strings
 */
function playersToIds(players)
{
    let usernameArr = [];
    players.forEach(function (p) {
        usernameArr.push([p.user.id]);
    });
    return usernameArr;
    /*return [
        ["240106095132147723"], //BROADBANNED
        ["254591454041604096"], //InFlamesForever
        ["165994107003600896"], //Toby Campbell
        ["109055610879770624"], //Refiya
        ["222168740136091649"], //Glickman
        ["254135467434311682"], //Alroytt
        ["222454850288484352"], //Khalid
        ["192297461748858880"], //Zlozz
        ["89230908632080384"], //Remy
        ["321766950000918539"] //Boot
    ];*/
}

/**
 * Takes 2 arrays of GuildMember(player) objects, team1 and team2
 * these players are then moved to the team 1 and team 2 voice channel.
 * @param team1Arr the array of players to be moved to voice channel team 1
 * @param team2Arr the array of players to be moved to voice channel team 2
 */
function splitTeams(team1Arr, team2Arr)
{
    let team1Channel = getChannel(team1ChannelName);
    let team2Channel = getChannel(team2ChannelName);

    if (team1Channel !== undefined || team2Channel !== undefined) {
        team1Arr.forEach(function (player) {
            player.setVoiceChannel(team1Channel);
        });

        team2Arr.forEach(function (player) {
            player.setVoiceChannel(team2Channel);
        });
    }
}

/**
 * searched by id for a guild member in an array of guild members
 * @param membersArr the array of guild members to be searched
 * @param idOfPlayer the id of the player being searched for
 */
function findGuildMemberInArray(membersArr, idOfPlayer)
{
    let foundMember;
    membersArr.forEach(member => {
        if(member.user.id === idOfPlayer)
        {
            foundMember = member;
        }
    });
    return foundMember;
}

/**
 * Takes a time and an interval in seconds and returns
 * the time since the last announcement in seconds
 * @param lastUsedTime (moment object) the time it was last used
 * @returns {int} whether the cool down is complete
 */
function timeSinceLastAnnouncement(lastUsedTime)
{
    if(lastUsedTime !== undefined)
    {
        const now = moment();
        let diff = moment.duration(lastUsedTime.diff(now)).asSeconds();
        if(diff < 0)
        {
            diff = Math.abs(diff);
        }
        return Math.round(diff);
    }
    else
    {
        return -1;
    }
}

/**
 * finds a player based on ID in an array of player objects
 * @param playerId the players id
 * @param playersArr an array of players to be searched
 * @returns {*} the player found
 */
function findPlayerInArr(playerId, playersArr)
{
    let retPlayer;
    playersArr.forEach(player =>
    {
        if(player.getID() === playerId)
        {
            retPlayer = player;
        }
    });
    return retPlayer;
}

/**
 * gets which result was voted for with validation
 * @returns {*} a string to be output telling the results of voting
 */
function finishVoting()
{
    votingStarted = false;

    let votesTeam = [0, 0, 0, 0, 0];

    playersArr.forEach(player =>
    {
        switch (parseInt(player.getVote()))
        {
            case 1:
                votesTeam[0]++;
                break;
            case 2:
                votesTeam[1]++;
                break;
            case 3:
                votesTeam[2]++;
                break;
            case 4:
                votesTeam[3]++;
                break;
            case 5:
                votesTeam[4]++;
                break;
        }
    });

    let max = -1;
    let twoMax = -1;
    let found = -1;

    for(let i = 0; i < votesTeam.length; i++)
    {
        if(parseInt(votesTeam[i]) === max)
        {
            twoMax = votesTeam[i];
        }
        else if(parseInt(votesTeam[i]) > max)
        {
            max = votesTeam[i];
            found = i;
        }
    }

    if(max === twoMax)
    {
        return "Two or more results scored the highest. Please make teams again.";
    }
    else
    {
        chosenMatch = matches[found];
        return "The chosen result is: " + (found + 1);
    }
}

//********************************************************************************************************
//End of functions







// Bot will now attempt to login
//********************************************************************************************************
console.log("about to login")
try {bot.login(botToken);}
catch (e) {console.log(e);}

//output message to console if debug value is 1 in botSettings.json
//********************************************************************************************************
if (debug)
{
    console.log('bot.js loaded succesfully!');
}
