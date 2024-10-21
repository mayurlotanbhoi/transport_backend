import cluster from 'cluster'
import { config } from 'dotenv'
// import os from 'os'
import { app } from './app.js'
import connectToDb from "./db/index.js"

config({ path: "../.env" })

const port = process.env.PORT || 8000


connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Worker ${process.pid} is running on port ${port}`);
    });
}).catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})