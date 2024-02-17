const express = require('express');
const search = require('yt-search');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

// Route to handle the search request
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const results = await search(query);

        // Extract relevant data from search results
        const videos = results.videos.map(video => ({
            title: video.title,
            thumbnail: video.thumbnail,
            channel: video.author.name,
            url: video.url,
        }));

        res.json(videos);
    } catch (error) {
        console.error('Error occurred while searching:', error);
        res.status(500).send('Error occurred while searching');
    }
});

// Serve the HTML file
app.use(express.static("public"));



// Function to stream audio from YouTube video
app.get('/audio', async (req, res) => {
    try {
        const youtubeUrl = decodeURIComponent(req.query.url);
        // Check if the URL is valid
        if (!ytdl.validateURL(youtubeUrl)) {
            res.status(400).send('Invalid YouTube URL');
            return;
        }

        // Get video info
        const videoInfo = await ytdl.getInfo(youtubeUrl);

        // Pipe the audio stream to response
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': `attachment; filename="${videoInfo.videoDetails.title}.mp3"`
        });
        ytdl(youtubeUrl, { filter: 'audioonly' }).pipe(res);
    } catch (error) {
        console.error('Error occurred while streaming:', error);
        res.status(500).send('Error occurred while streaming');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
