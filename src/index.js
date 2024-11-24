import cluster from 'cluster';
import { config } from 'dotenv';
import os from 'os';
import { app } from './app.js';
import connectToDb from './db/index.js';

// Load environment variables
config({ path: "../.env" });

const port = process.env.PORT || 8000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Master process ${process.pid} is running`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handle worker exit and restart
    cluster.on('exit', (worker, code, signal) => {
        console.error(`Worker ${worker.process.pid} exited with code ${code} (${signal || 'no signal'})`);
        console.log('Spawning a new worker...');
        cluster.fork();
    });
} else {
    // Worker processes
    const startServer = async () => {
        try {
            await connectToDb();
            app.listen(port, () => {
                console.log(`Worker ${process.pid} is running on port ${port}`);
            });
        } catch (error) {
            console.error(`Failed to connect to MongoDB: ${error.message}`);
            process.exit(1); // Exit the worker if DB connection fails
        }
    };

    startServer();
}
