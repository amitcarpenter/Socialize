require("dotenv").config();
const express = require("express");
const pool = require("./config/database");
const axios = require("axios");
const cors = require('cors');
const user_router = require("./src/routes/userRoutes");
const path = require("path");

const SocialPost = require("social-post-api");
const API_KEY = process.env.SOCIAL_API_KEY;
const social = new SocialPost(API_KEY);

const { IgApiClient } = require("instagram-private-api");
const { get } = require("request-promise");
const cron = require("node-cron");
const { CronJob } = require("cron");
const moment = require("moment-timezone");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const port = process.env.PORT || 3000;
const app = express();

// Middle ware
app.use(cors());
app.use("/api/", user_router);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Test the database connection
pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the database:", result.rows[0].now);
    }
});

app.listen(port, () => {
    console.log(`server is working ${port}`);
});


// Schedule Post
app.post("/api/schedule-post", async (req, res) => {
    try {
        let social_media_array = req.body.social_media_array;
        let image_post = req.body.image_post;
        let post_content = req.body.post_content;

        // let schedule_time = new Date(req.body.schedule_time);
        let schedule_time = moment(req.body.schedule_time).toDate();

        // Validate if the provided schedule_time is a valid date
        if (!moment(schedule_time).isValid()) {
            return res.status(400).json({ error: "Invalid schedule_time format" });
        }
        // Save data to PostgreSQL database
        const insertQuery = `
            INSERT INTO scheduled_posts (social_media_array, schedule_time, image_post, post_content)
            VALUES ($1, $2, $3, $4)
        `;

        const values = [
            social_media_array,
            schedule_time,
            image_post,
            post_content,
        ];
        await pool.query(insertQuery, values);

        const cronExpression = moment(schedule_time).format("m H D M d"); // Minute Hour Day Month DayOfWeek
        console.log(cronExpression);

        const cronJob = new CronJob(cronExpression, async () => {
            const run = async () => {
                const post = await social
                    .post({
                        post: post_content,
                        platforms: social_media_array,
                        // platforms: ["twitter", "facebook", "instagram", "linkedin"],
                        mediaUrls: image_post,
                    })
                    .catch(console.error);
                console.log(post);
            };

            const postToInsta = async () => {
                const ig = new IgApiClient();
                ig.state.generateDevice(process.env.IG_USERNAME);
                await ig.account.login(
                    process.env.IG_USERNAME,
                    process.env.IG_PASSWORD
                );

                const imageBuffer = await get({
                    url: image_post,
                    encoding: null,
                });
                const caption = post_content;
                const media = await ig.publish.photo({
                    file: imageBuffer,
                    caption: caption,
                });
                console.log("Media ID:", media.id);
            };
            await run();

            if (social_media_array.includes("instagram")) {
                console.log("function Call insta");
                await postToInsta();
            }

            cronJob.stop();
        });

        cronJob.start();
        res.status(200).json({ message: `schedule post for ${schedule_time} ` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// get data from the schedule post 
app.get("/api/get-scheduled-posts", async (req, res) => {
    try {
        // Fetch all data from the scheduled_posts table
        const query = "SELECT * FROM scheduled_posts";
        const result = await pool.query(query);

        // Return the data as JSON
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// edit schedule post
app.put("/api/edit-scheduled-post/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const { social_media_array, schedule_time, image_post, post_content } = req.body;

        // Update data in the scheduled_posts table
        const updateQuery = `
            UPDATE scheduled_posts
            SET social_media_array = $1, schedule_time = $2, image_post = $3, post_content = $4
            WHERE id = $5
        `;

        const values = [social_media_array, schedule_time, image_post, post_content, postId];
        await pool.query(updateQuery, values);

        res.status(200).json({ message: "Update successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// delete schedule post
app.delete("/api/delete-scheduled-post/:id", async (req, res) => {
    try {
        const postId = req.params.id;

        // Delete the scheduled post from the scheduled_posts table
        const deleteQuery = `
            DELETE FROM scheduled_posts
            WHERE id = $1
        `;

        const values = [postId];
        await pool.query(deleteQuery, values);

        res.status(200).json({ message: "Delete successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// add linkedin data
app.post("/api/add-linkedin-data/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { email, password } = req.body;
        const status = "pending"

        // Insert data into the linkedin_data table with the associated user_id
        const insertQuery = `
            INSERT INTO linkedin_data (user_id, email, password)
            VALUES ($1, $2, $3)
        `;

        const values = [userId, email, password];
        await pool.query(insertQuery, values);

        res.status(200).json({ message: "LinkedIn data added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Twitter Data API
app.post("/api/add-twitter-data/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, password } = req.body;
        const insertQuery = `
            INSERT INTO twitter_data (user_id, username, password)
            VALUES ($1, $2, $3)
        `;

        const values = [userId, username, password];
        await pool.query(insertQuery, values);

        res.status(200).json({ message: "Twitter data added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Instagram Data API
app.post("/api/add-instagram-data/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, password } = req.body;
        const insertQuery = `
            INSERT INTO instagram_data (user_id, username, password)
            VALUES ($1, $2, $3)
        `;

        const values = [userId, username, password];
        await pool.query(insertQuery, values);

        res.status(200).json({ message: "Instagram data added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Facebook Data API
app.post("/api/add-facebook-data/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, password } = req.body;
        const insertQuery = `
            INSERT INTO facebook_data (user_id, username, password)
            VALUES ($1, $2, $3)
        `;

        const values = [userId, username, password];
        await pool.query(insertQuery, values);

        res.status(200).json({ message: "Facebook data added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.get("/test", (req, res) => {
    res.send("test amit")
})