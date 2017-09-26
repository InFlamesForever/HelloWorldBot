
let google = require('googleapis');
let authentication = require("./authentication");

class botFunctions
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
    //********************************************************************************************************
    //End of function

    /*
    //Start of function
      //********************************************************************************************************
      writeDataPromise(auth)
        {
            var sheets = google.sheets('v4');
            var values =  [
                            ["240106095132147723"],
                            ["254591454041604096"],
                            ["165994107003600896"],
                            ["109055610879770624"],
                            ["222168740136091649"],
                            ["254135467434311682"],
                            ["222454850288484352"],
                            ["192297461748858880"],
                            ["89230908632080384"],
                            ["321766950000918539"]
                          ];
            var body = {values: values};

            return new Promise(
                function (fulfill, reject)
                {
                    sheets.spreadsheets.values.update(
                        {
                            auth: auth,
                            spreadsheetId: '1g7Q8SG0pzZ9JAldTeAt7geS9gkTa1c6IgucsPM9P9f0',
                            range: 'MatchMakerUID!H2:H11',
                            valueInputOption: "USER_ENTERED",
                            resource: body
                        },
                        (err, response) =>
                        {
                            if (err)
                            {
                                reject('The API returned an error: ' + err);
                                //return;
                            }
                            else
                            {
                                var result = "Sucesfully written to google sheets.";
                                fulfill(result);
                                console.log("Sucesfully written to google sheets.")
                            }
                        })
                });
        }


    */


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
    /*
    batchGetData(auth)
    {
        var teams = '';
        var sheets = google.sheets('v4');
        var ranges =  [
          'MatchMakerUID!H18:H46',
          'MatchMakerUID!T17:T21',
                      ];

        return new Promise(
            function (fulfill, reject)
            {
                sheets.spreadsheets.values.batchGet(
                    {
                        auth: auth,
                        spreadsheetId: '1g7Q8SG0pzZ9JAldTeAt7geS9gkTa1c6IgucsPM9P9f0',
                        ranges: ranges
                    },
                    (err, response) =>
                    {
                        if (err)
                        {
                            reject('The API returned an error: ' + err);
                        }
                        var rows = response.valueRanges;
                        console.log('get Batch Ranges')
                        console.log(rows)
                        if (rows.length === 0)
                        {
                            //console.log('No data found.');
                        }
                        else
                        {
                            fulfill(rows);
                        }
                    })
            });
    }
    */
    //********************************************************************************************************
    //End of function

}

module.exports = new botFunctions();
