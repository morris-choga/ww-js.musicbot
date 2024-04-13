const {MessageMedia} = require("whatsapp-web.js");

const fs = require("fs");

// let apiUrl = "http://ww-js-musicbot-api.onrender.com";
let apiUrl = "http://127.0.0.1:5000";
let requestOptions = {
    method: 'POST',
    headers: {"Content-Type": "application/json"},
    body: {},
    redirect: 'follow'
};


const sendLyrics =  async (message,client) => {
    requestOptions.body = JSON.stringify({"key": message.body.substring(8)})
    let lyrics = await fetch(`${apiUrl}/lyrics`, requestOptions)
        .then((response) => {


            if (response.ok) {
                return response.json()
            }
            return "Error"
        }).then((data) => {
            return data
        }).catch(error => console.log('an error has occurred while fetching https://127.0.0.1:5000/lyrics ', error))


    if (typeof lyrics === "object" && !Object.keys(lyrics).length == 0){
        let picture = await MessageMedia.fromUrl(lyrics["album_art"], { unsafeMime: true })


        setTimeout(async ()=>{

            try {
                await client.sendMessage(message._data.from,picture,{caption: lyrics["lyrics"],quotedMessageId:message.id._serialized})
            } catch (error) {
                console.log(`Error sending message ${error}`)

            }

        }, 10000);




    }
    else {
        setTimeout(async ()=>{

            try {
                await message.reply("oops! lyrics for this song are unavailable\nuse !menu for help")

            } catch (error) {
                console.log(`Error sending message ${error}`)

            }

        }, 10000);



        console.log("An error has occurred while searching lyrics: No object was received or the object was empty")
    }
}

const sendSongInfo =  async (message,client) => {

    requestOptions.body = JSON.stringify({"key": message.body.substring(11)})
    let songInfo = await fetch(`${apiUrl}/getsonginfo`, requestOptions)
        .then((response) => {


            if (response.ok) {
                return response.json()
            }
            return "Error"
        }).then((data) => {
            return data
        }).catch(error => console.log('an error has occurred while fetching https://api:5000/getsonginfo', error))


    if (typeof songInfo === "object" && !Object.keys(songInfo).length === 0){
        let picture = await MessageMedia.fromUrl(songInfo["album_art"], { unsafeMime: true })


        setTimeout(async ()=>{
            try {
                await client.sendMessage(message._data.from,picture,{caption: `*Title: ${songInfo.title}*\n*Artist: ${songInfo.artist}*\n*Album: ${songInfo.album}*\n*Year: ${songInfo.year}*`,quotedMessageId:message.id._serialized})

            } catch (error) {
                console.log(`Error sending message ${error}`)
            }

        }, 10000);


    }
    else {
        setTimeout(async ()=>{

            await message.reply("oops! info for this song are unavailable")
            console.log("An error has occurred while searching song info: No object was received or the object was empty")
        }, 10000);

    }

}




module.exports = { sendLyrics, sendSongInfo};