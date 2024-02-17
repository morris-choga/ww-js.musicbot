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


let requestOptions = {
    method: 'POST',
    headers: {"Content-Type": "application/json"},
    body: {},
    redirect: 'follow'
};

let apiKey = "patg3nVCYWdoRthJn.56198a4363e0982055386462c75e70566e51bc2b4bac7cd605b6996a87b51521";
let airtableUrl = "https://api.airtable.com/v0/appAcgdXpcBoOwP5X/tblk48SN08xOlGQz9"
let apiUrl = "http://api:5000";

async function fetchGroups(){

    let result = await fetch(airtableUrl,{
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    }).then((response)=>{
        body = response.json()
        return body
    }).then((response)=>{

        let groupIDs = []
        let group = response.records
        Object.keys(response.records).forEach((key) => {
            groupIDs.push(group[key].fields.groupID)
        })

        return groupIDs

    }).catch(error=>{
        console.log(`An error occurred while fetching https://api.airtable.com: ${error}`)
    });
    return result

}

client.on('message', async (message) => {
    // let groups = await fetchGroups()


    let groupParticipantsNumber = (await message.getChat()).isGroup ? (await message.getChat()).participants.length : 0

    // if(message.body.toLocaleLowerCase().startsWith("test")){
    //     console.log((await message.getChat()).id.user)
    //     console.log(groupParticipantsNumber)
    //
    // }


    if(message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && (await message.getChat()).isGroup  && (groupParticipantsNumber >= 11 || (await message.getChat()).id.user === "120363213455576189")){

        requestOptions.body = JSON.stringify({"key": message.body})
        let songPath = await fetch(apiUrl, requestOptions)
            .then((response) => {
                if(response.ok){
                    return response.text()
                }
                return "Error"
            })
            .then((data)=>{
                let response = data
                let apiResponse = response.replace("api","app")
                return apiResponse
            })
            .catch(error => console.log('an error has occurred while fetching https://api:5000 ', error))



        if (typeof songPath !== "undefined" && songPath !=="Error"){
            let song = MessageMedia.fromFilePath(songPath)

            try{
                await message.reply(song)}
            catch (e){
                console.log(`An error has occurred while sending media: ${e}`)
            }

            fs.unlink(songPath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err.message}`);
                } else {
                    console.log(`${message.body.toLocaleLowerCase()} sent`);
                }
            });

        }
    }

    else if (message.body.toLocaleLowerCase().startsWith("!album ") && message.body.length > 7 && (await message.getChat()).isGroup){
        await message.reply("Album request is still in development...")
    }

    else if (message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && (await message.getChat()).isGroup  && groupParticipantsNumber < 11){
        await message.reply(`The music bot only works in a group with at least 10 participants. Please add ${11 - (await message.getChat()).participants.length} more people to the group`)
    }
    else if (message.body.toLocaleLowerCase().startsWith("!song ") && message.body.length > 6 && !(await message.getChat()).isGroup){
        await message.reply("For now the bot can only work in a group chat. Please add me in a group to  request for songs...")
    }


});

client.initialize();

