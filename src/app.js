import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from 'path';
import rateLimit from 'express-rate-limit';
import errorHandler from "./middlewares/errorHandler.middleware.js";
// import session from 'express-session';
// import { v4 as uuidv4 } from 'uuid'; // For generating session IDs

const app = express()


const allowedOrigins = [
    '*',
    'http://localhost:5173',
    'https://transporterbook.netlify.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    withCredentials: true
}));

app.options('*', cors({
    origin: allowedOrigins,
    credentials: true,
    withCredentials: true
}));

app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))
// Set up static file serving from the public directory
const publicDirectoryPath = path.join(process.cwd(), 'public'); // Use process.cwd() to get the current working directory
app.use('/public', express.static(publicDirectoryPath)); // Adjust the base URL for serving static files

// Set up session middleware
app.use(cookieParser());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute in milliseconds
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// import all routs
import user from "./routes/user.routes.js"
import auth from "./routes/auth.routes.js"
import city from "./routes/city.routes.js"
import Vehicale from "./routes/lorry_details.routes.js"
import Trips from "./routes/tripHistory.routes.js"
import plance from "./routes/plan_History.routes.js"




// user routes here
app.use("/api/v1/user", user)
app.use("/api/v1/auth", auth)
app.use("/api/v1/cities", city)
app.use("/api/v1/vehicale", Vehicale)
app.use("/api/v1/trips", Trips)
app.use("/api/v1/plance", plance)

app.get('*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// app.use(errorHandler)

app.use(errorHandler);

export { app }