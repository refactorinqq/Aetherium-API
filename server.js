import express from "express";
import { JsonDB, Config } from 'node-json-db';
import { configDotenv } from "dotenv";
import { Webhook } from 'discord-webhook-node';
configDotenv()
const hook = new Webhook(process.env.log);
const log = new Webhook(process.env.message);
hook.setUsername('Aetherium API');
log.setUsername("Aetherium Server Logs");
var db = new JsonDB(new Config("aetherium", true, false, '/'));
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
await db.push("/startLog", new Date().getTime());

app.get("/", (req, res) => {
   res.json({
    status: 200,
    authors: "Aetherium Development"
   })
});

app.post("/join", async (req, res) => {
    const username = req.body.username;
    const uuid = req.body.uuid;

    console.log(`[i] New connection: ${username} / ${uuid}`)
    
    const arr = await db.getData("/joins")
    console.log(arr)
    const exists = arr.some((user) => user.username === username && user.uuid === uuid);
    
    if(!exists) {
        await db.push("/unique", [{
            username: username,
            uuid: uuid,
            time: new Date().getTime()
        }], false)
    }

    await db.push("/joins", [{
        username: username,
        uuid: uuid,
        time: new Date().getTime()
    }], false);

    hook.send(`**[i]** New connection: **${username}** / **${uuid}**`);

    res.json({
        success: true
    })
});

const PORT = 8080;

app.listen(PORT, () => {
    log.send(`**[INFO]** Server is running.`)
    console.log(`Server is running on PORT: ${PORT}`);
});