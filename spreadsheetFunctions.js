let google = require('googleapis');

class spreadsheetFunctions
{
    //Start of function
    //********************************************************************************************************
    sendPlayerIDsToGoogleSheets(auth, players)
    {
        let sheets = google.sheets('v4');
        let body = {values: players};

        sheets.spreadsheets.values.update
        (
            {
                auth: auth,
                spreadsheetId: '1g7Q8SG0pzZ9JAldTeAt7geS9gkTa1c6IgucsPM9P9f0',
                range: 'MatchMakerUID!H2:H11',
                valueInputOption: "USER_ENTERED",
                resource: body
            },
            (err, response) => {
                if (err)
                {
                    console.log('The API returned an error: ' + err);
                }
                else
                {
                    console.log("Updated");
                }
            }
        )


    };


    //Start of function
    //********************************************************************************************************
    fetchTeamsOutput(auth)
    {
        let sheets = google.sheets('v4');

        return new Promise(
            function (fulfill, reject)
            {
                sheets.spreadsheets.values.get(
                    {
                        auth: auth,
                        spreadsheetId: '1g7Q8SG0pzZ9JAldTeAt7geS9gkTa1c6IgucsPM9P9f0',
                        range: 'MatchMakerUID!H18:H46',
                    },
                    (err, response) =>
                    {
                        if (err)
                        {
                            reject('The API returned an error: ' + err);
                        }
                        let rows = response.values;
                        if (rows.length === 0)
                        {
                            console.log('No data found.');
                        }
                        else
                        {
                            fulfill(rows);
                        }
                    })
            });
    }

    fetchTeamsArray(auth)
    {
        let sheets = google.sheets('v4');

        return new Promise(
            function (fulfill, reject)
            {
                sheets.spreadsheets.values.get(
                    {
                        auth: auth,
                        spreadsheetId: '1g7Q8SG0pzZ9JAldTeAt7geS9gkTa1c6IgucsPM9P9f0',
                        range: 'BalancedTeamsUID!A2:T6',
                    },
                    (err, response) =>
                    {
                        if (err)
                        {
                            reject('The API returned an error: ' + err);
                        }
                        let rows = response.values;
                        if (rows.length === 0)
                        {
                            console.log('No data found.');
                        }
                        else
                        {
                            fulfill(rows);
                        }
                    })
            });
    }

    fetchPlayers(auth)
    {
        let sheets = google.sheets('v4');

        return new Promise(
            function (fulfill, reject)
            {
                sheets.spreadsheets.values.get(
                    {
                        auth: auth,
                        spreadsheetId: '1g7Q8SG0pzZ9JAldTeAt7geS9gkTa1c6IgucsPM9P9f0',
                        range: 'Players!A2:E',
                    },
                    (err, response) =>
                    {
                        if (err)
                        {
                            reject('The API returned an error: ' + err);
                        }
                        let rows = response.values;
                        if (rows.length === 0)
                        {
                            console.log('No data found.');
                        }
                        else
                        {
                            fulfill(rows);
                        }
                    })
            });
    }

}

module.exports = new spreadsheetFunctions();
