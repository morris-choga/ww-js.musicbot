const qrcode = require('qrcode-terminal');
const { sendSong , sendLyrics, sendSongInfo, searchSong} = require("./messenger");
const { Client,LocalAuth ,MessageMedia, LinkingMethod } = require('whatsapp-web.js');






class Bot{
    messageCount = 0;


    constructor(sessionName,range) {

        let reInitializeCount = 0
        this.client = new Client({

            // linkingMethod:  new LinkingMethod({
            //     phone: {
            //         number: "+639514176425"
            //     }
            // }),
            authStrategy: new LocalAuth({
                dataPath: "./sessions",
                // dataPath: "C:\\Users\\Mchog\\WebstormProjects\\ww-js.musicbot\\sessions",
                clientId: `${sessionName}`
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    // '--disable-setuid-sandbox',
                    // '--single-process',
                    // '--disable-gpu'
                ]
            },
            // webVersion: '2.2409.2',
            // webVersionCache: {
            //     type: 'remote',
            //     // remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
            //     remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.2.html'
            // }
        });
        process.on('SIGINT', async () => {
            await this.client.destroy();
            process.exit(0);
        });

        this.client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
        });

        this.client.on('code', (code) => {
            console.log('CODE RECEIVED', code);

        });


        this.client.on('ready', () => {
            console.log(`bot ${sessionName} ready!`);
        });

        this.client.on('message', async (message) => {
            let userId = (await message.id.participant);
            let song_group = "120363223962652835"
            let test_group = "120363243170575745"
            let lyrics_group =  "120363244367417149"
            let chat_id = (await message.getChat()).id.user
            let message_body = message.body.toLocaleLowerCase()
            let groupParticipantsNumber = (await message.getChat()).isGroup ? (await message.getChat()).participants.length : 0

            if (message_body.startsWith("message_count")){
                console.log(`Bot ${sessionName} has ${this.getMessageCount()} messages`)

            }

            if((message_body.includes("https://")) && !message_body.includes("request") && (chat_id === test_group || chat_id === lyrics_group || chat_id === song_group)){

                setTimeout(async ()=>{

                    try {
                        await message.delete(true)

                    } catch (error) {
                        console.log(`Error deleting message ${error}`)

                    }


                }, 10000);


            }

            if ((message_body.startsWith("!song") || message_body.startsWith("!lyrics")) && message.body.length > 6 && !(await message.getChat()).isGroup){

                await message.reply("For now the bot can only work in a group chat. Please add me in a group to  request for songs...")
                this.messageCount++;

            }

            if((await message.getChat()).isGroup && (chat_id !== song_group && chat_id !== lyrics_group && chat_id !== test_group ) && (message_body.startsWith("!song") || message_body.startsWith("!lyrics"))){

                if (groupParticipantsNumber < 11) {
                    setTimeout(async () => {
                        await message.reply(`The music bot only works in a group with at least 10 participants. Please add ${11 - (await message.getChat()).participants.length} more people to the group`)
                        this.messageCount++;
                    }, 5000);
                }

                else {

                    await message.reply("Join the group to request for songs \n\nhttps://chat.whatsapp.com/F1l3b5zU8N652cm0gmUuUS")
                    this.messageCount++;


                }

            }




            if(userId === undefined ? false : range.includes(parseInt(userId.substring(0, userId.indexOf('@')).charAt(userId.substring(0, userId.indexOf('@')).length - 1)))){



                let options = ["1","2","3"]
                let isGroup = (await message.getChat()).isGroup

                if (message_body.startsWith("id")&& isGroup){
                    console.log(message)
                    console.log(chat_id)
                }





                else if((message_body.startsWith("!menu") || message_body.startsWith("!help")) && (chat_id === song_group || chat_id === lyrics_group || chat_id === test_group)){
                    await message.reply("*Bot commands*\n\n🤖*!song* (eg !song rihanna diamonds)\n🤖*!lyrics* (eg !lyrics Maroon 5 sugar)\n🤖*!song-info* (eg !song-info eminem not afraid. Get information about a song. )\n\nNB: !song-info can be used to verify if a song exists to avoid requesting and downloading wrong song")
                    this.messageCount++;
                }


                else if (message_body.startsWith("!lyrics ") && message.body.length > 8 && (chat_id === lyrics_group || chat_id === test_group)){
                    await sendLyrics(message,this.client)
                    this.messageCount++;
                }
                else if (message_body.startsWith("!lyrics ") && message.body.length > 8 ){
                    await message.reply("Join the group to request for lyrics \n\nhttps://chat.whatsapp.com/DGeFgy7DRODIIgF68mojTP")
                    this.messageCount++;
                }

                else if ((message_body.startsWith("!song-info ") || message_body.startsWith("!song_info ")) && (message.body.length > 11) && (chat_id === lyrics_group || chat_id === song_group)) {
                    await sendSongInfo(message,this.client)
                    this.messageCount++;

                }

                else if (message_body.startsWith("!song ") && message.body.length > 6 && isGroup) {

                    if (chat_id === lyrics_group) {

                        await message.reply("Join the group to request for songs \n\nhttps://chat.whatsapp.com/F1l3b5zU8N652cm0gmUuUS")
                        this.messageCount++;
                        // await message.reply("The bot is undergoing maintenance. Contact the admin to offer support for the project 😊")

                    }




                }



                else if (message_body.startsWith("!album ") && message.body.length > 7 && isGroup) {



                    await message.reply("Album request is still in development...")
                    this.messageCount++;


                }

            }




        })

        this.client.on("disconnected",(reason)=>{
            console.log(`Client has been disconnected Morris because of ${reason} `);

            if(reInitializeCount < 15 && reason === 'NAVIGATION') {
                reInitializeCount++;
                this.client.initialize();
                return;
            }
        });
    }


    getMessageCount(){
        return this.messageCount
    }
    initialize() {
        // Initialize your client here if necessary
        this.client.initialize();
    }






}

// const bot1 = new Bot("4789",[0,1,2,3,4]);
const bot2 = new Bot("4221",[0,1,2,3,4,5,6,7,8,9]);

// bot1.initialize();
bot2.initialize();


