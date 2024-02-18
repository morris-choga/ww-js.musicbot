const qrcode = require('qrcode-terminal');
const { Client,LocalAuth ,MessageMedia, Buttons } = require('whatsapp-web.js');


const client = new Client({
    authStrategy: new LocalAuth(),
     puppeteer: {
           headless: true,
           args: ['--no-sandbox']
           }
});
process.on('SIGINT', async () => {
    await this.client.destroy();
    process.exit(0);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

const fs = require('fs');



let apiKey = "patg3nVCYWdoRthJn.56198a4363e0982055386462c75e70566e51bc2b4bac7cd605b6996a87b51521";
let airtableUrl = "https://api.airtable.com/v0/appAcgdXpcBoOwP5X/tblk48SN08xOlGQz9"
let apiUrl = "http://127.0.0.1:5000";

let requestOptions = {
    method: 'POST',
    headers: {"Content-Type": "application/json"},
    body: {},
    redirect: 'follow'
};

let addSong = {
    "fields": {"#songs":10}
}

userInfo = {
    "records": [{"fields":{
        "userID": "","userName": "","userCountry": "","#songs": 1
    }
}]}

async function fetchCountry(num){
    let result = await fetch(`https://lookups.twilio.com/v2/PhoneNumbers/+${num}`, {
        headers: {
            'Authorization': "Basic QUMwYTEyNDRhYzA4Y2Q3Nzc1ZTFhZjhmZjg2ODk2OTNiYjpmMjNhYjU1NTJkM2NiNjUxZjc2ZDhiODhhYjM4YmU4Yg==",
            'Content-Type': 'application/json',
        },
    }).then((response)=>{
        let body = response.json()

        return body}).then((data)=>{
            let country = data.country_code
        return country
    }).catch(error=>{
        console.log(`An error occurred while fetching country: ${error}`)
    })
    return result
}


async  function songIncrement(id){


    let result = await fetch(`${airtableUrl}/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(addSong)
    })

}

async function fetchUsers(){

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

            // userInfo[users[key].fields.userID] = users[key].fields["#songs"]
            userInfo[users[key].fields.userID] = [users[key].id,users[key].fields["#songs"]]

        })

        return userInfo

    }).catch(error=>{
        console.log(`An error occurred while fetching https://api.airtable.com: ${error}`)
    });

    return result

}

async function addUser(){

    await fetch(airtableUrl, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo)
    }).catch(error=>{
        console.log(`An error occurred while addingUser https://api.airtable.com: ${error}`)
    })
}



client.on('message', async (message) => {



    let groupParticipantsNumber = (await message.getChat()).isGroup ? (await message.getChat()).participants.length : 0
    let isGroup = (await message.getChat()).isGroup


    if (message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && isGroup) {


        if ((await message.getChat()).id.user === "120363213455576189") {

            let userID = (await message.id.participant).substring(0,(await message.id.participant).indexOf('@'))
            let userName = await message._data.notifyName
            let userCountry = await fetchCountry(userID)
            let registeredUsers =await fetchUsers()




            Object.keys(registeredUsers).includes(userID) ? await (async function () {

                if (registeredUsers[userID][1] < 10) {
                    console.log("Sending song ")
                    addSong.fields["#songs"] = registeredUsers[userID][1] + 1
                    songIncrement(registeredUsers[userID][0])

                    let songPath = await fetch(apiUrl, requestOptions)
                        .then((response) => {
                            if (response.ok) {
                                return response.text()
                            }
                            return "Error"
                        }).then((data) => {
                            let response = data
                            let apiResponse = response.replace("api", "app")
                            return apiResponse
                        }).catch(error => console.log('an error has occurred while fetching https://127.0.0.1:5000 ', error))
                } else {
                    message.reply("You have exceeded your daily limit...")
                }

            })():(function () {
                userInfo.records[0].fields.userID = userID
                userInfo.records[0].fields.userName = userName
                userInfo.records[0].fields.userCountry = userCountry
                addUser()
            })()

            requestOptions.body = JSON.stringify({"key": message.body})



            if (typeof songPath !== "undefined" && songPath !== "Error") {
                let song = MessageMedia.fromFilePath(songPath)

                try {
                    await message.reply(song)
                } catch (e) {
                    console.log(`An error has occurred while sending media: ${e}`)
                }

                fs.unlink(songPath, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${err.message}`);
                    } else {
                        console.log(`${message.body.toLocaleLowerCase()} sent`);
                    }
                });

            } else if (!isGroup) {
                await message.reply("For now the bot can only work in a group chat. Please add me in a group to  request for songs...")
            }
        }


        else if (groupParticipantsNumber < 11) {
            setTimeout(async () => {
                await message.reply(`The music bot only works in a group with at least 10 participants. Please add ${11 - (await message.getChat()).participants.length} more people to the group`)
            }, 5000);
              } else if (groupParticipantsNumber >= 11) {
            setTimeout(async () => {
                await message.reply("Join the community...")
            }, 5000);

        }

    }

    else if (message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && !isGroup){
        setTimeout(async () => {
            await message.reply("For now the bot can only work in a group chat. Please add me in a group to  request for songs...")
        }, 5000);

    }

    else if (message.body.toLocaleLowerCase().startsWith("!album ") && message.body.length > 7 && isGroup) {
        setTimeout(async () => {
            await message.reply("Album request is still in development...")
        }, 5000);

    }

})






//     if(message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && isGroup  && (await message.getChat()).id.user === "120363213455576189"){
//
//         requestOptions.body = JSON.stringify({"key": message.body})
//         let songPath = await fetch(apiUrl, requestOptions)
//             .then((response) => {
//                 if(response.ok){
//                     return response.text()
//                 }
//                 return "Error"
//             })
//             .then((data)=>{
//                 let response = data
//                 let apiResponse = response.replace("api","app")
//                 return apiResponse
//             })
//             .catch(error => console.log('an error has occurred while fetching https://api:5000 ', error))
//
//
//
//         if (typeof songPath !== "undefined" && songPath !=="Error"){
//             let song = MessageMedia.fromFilePath(songPath)
//
//             try{
//                 await message.reply(song)}
//             catch (e){
//                 console.log(`An error has occurred while sending media: ${e}`)
//             }
//
//             fs.unlink(songPath, (err) => {
//                 if (err) {
//                     console.error(`Error deleting file: ${err.message}`);
//                 } else {
//                     console.log(`${message.body.toLocaleLowerCase()} sent`);
//                 }
//             });
//
//         }
//     }
//
//     else if (message.body.toLocaleLowerCase().startsWith("!album ") && message.body.length > 7 && isGroup){
//         await message.reply("Album request is still in development...")
//     }
//
//     else if (message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && isGroup  && groupParticipantsNumber < 11){
//         await message.reply(`The music bot only works in a group with at least 10 participants. Please add ${11 - (await message.getChat()).participants.length} more people to the group`)
//     }
//     else if (message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && !isGroup){
//         await message.reply("For now the bot can only work in a group chat. Please add me in a group to  request for songs...")
//     }
//
//     if(message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && isGroup  && groupParticipantsNumber >= 11){
//         await message.reply("Join the community...")
//     }
//
//
//
// });

client.initialize();

