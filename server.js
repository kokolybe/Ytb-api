const express = require('express');
const https = require('https');
const request = require('request');
const app = express();

// Port défini par Render ou par défaut 3000
const PORT = process.env.PORT || 3000;

app.get('/search', (req, res) => {
    const query = req.query.query; // Récupère le paramètre "query" depuis l'URL

    if (!query) {
        return res.status(400).send({ error: 'Le paramètre "query" est requis.' });
    }

    const options = {
        method: 'GET',
        hostname: 'yt-api.p.rapidapi.com',
        port: null,
        path: `/search?query=${encodeURIComponent(query)}`,
        headers: {
            'x-rapidapi-key': '36f745d486mshd6d8e5421dd8280p1f06d0jsn7a4caec6be1c',
            'x-rapidapi-host': 'yt-api.p.rapidapi.com',
        },
    };

    const apiReq = https.request(options, (apiRes) => {
        const chunks = [];

        apiRes.on('data', (chunk) => {
            chunks.push(chunk);
        });

        apiRes.on('end', () => {
            const body = Buffer.concat(chunks).toString();
            res.status(200).send(JSON.parse(body)); // Renvoie la réponse à l'utilisateur
        });
    });

    apiReq.on('error', (error) => {
        console.error(error);
        res.status(500).send({ error: 'Une erreur est survenue lors de l\'appel à l\'API.' });
    });

    apiReq.end();
});

app.get('/download', (req, res) => {
    const videoId = req.query.id;

    if (!videoId) {
        return res.status(400).send({ error: 'Le paramètre "id" est requis.' });
    }

    const options = {
        method: 'GET',
        url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl',
        qs: { id: videoId },
        headers: {
            'x-rapidapi-key': '36f745d486mshd6d8e5421dd8280p1f06d0jsn7a4caec6be1c',
            'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com',
        },
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            return res.status(500).send({ error: 'Une erreur est survenue lors de l\'appel à l\'API.' });
        }

        res.status(200).send(JSON.parse(body));
    });
});

app.get('/get-video-url', (req, res) => {
    const videoId = req.query.id;

    if (!videoId) {
        return res.status(400).send({ error: 'Le paramètre "id" est requis.' });
    }

    const options = {
        method: 'GET',
        url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl',
        qs: { id: videoId },
        headers: {
            'x-rapidapi-key': 'VOTRE_CLE_RAPIDAPI',
            'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com',
        },
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            return res.status(500).send({ error: 'Erreur lors de l\'appel à l\'API.' });
        }

        try {
            const data = JSON.parse(body);
            const allFormats = [...data.formats, ...data.adaptiveFormats]; // Combiner formats
            const desiredFormat = allFormats.find(format => format.itag === 248); // Trouver itag 248

            if (desiredFormat) {
                return res.status(200).send({ url: desiredFormat.url });
            } else {
                return res.status(404).send({ error: 'Format avec itag 248 introuvable.' });
            }
        } catch (parseError) {
            console.error(parseError);
            return res.status(500).send({ error: 'Erreur lors du traitement des données.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
