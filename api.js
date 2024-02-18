

async function fetchUsers(){
    console.log("Called")

    let result = await fetch(airtableUrl,{
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    }).then((response)=>{
        let body = response.json()

        return body
    }).then((response)=>{

        let userInfo = {}
        let users = response.records
        Object.keys(users).forEach((key) => {

            userInfo[users[key].fields.userID] = users[key].fields["#songs"]



        })

        return userInfo

    }).catch(error=>{
        console.log(`An error occurred while fetching https://api.airtable.com: ${error}`)
    });

    return result

}

function addUser(){

    fetch(airtableUrl, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            'Content-Type': 'application/json',

        },
        body: JSON.stringify({
            "records": [{"fields":{
                    "userID": "788655696","userName": "faki","userCountry": "Mzanzi","#songs": 1
                }
            }]})
    }).catch(error=>{
        console.log(`An error occurred while addingUser https://api.airtable.com: ${error}`)
    });
}

