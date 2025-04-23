const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let userLocations = {}; // { userId: { latitude, longitude } }

app.post("/updateLocation", (req, res) => {
    const { userId, latitude, longitude } = req.body;
    console.log("📡 Reçu /updateLocation :", req.body);

    if (!userId || !latitude || !longitude) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    userLocations[userId] = { latitude, longitude };
    res.json({ success: true });
});

app.post("/getLiveCounts", (req, res) => {
    const { terrains } = req.body;
    if (!terrains) {
        return res.status(400).json({ error: "Pas de terrains fournis" });
    }

    const result = {};
    terrains.forEach(terrain => {
        let count = 0;
        for (const userId in userLocations) {
            const u = userLocations[userId];
            const dist = getDistance(u.latitude, u.longitude, terrain.latitude, terrain.longitude);
            if (dist <= 150) count++;
        }
        result[terrain.id] = count;
    });

    res.json({ counts: result });
});

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 🔥 NE PAS HARDCODER 8080
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur prêt sur le port ${PORT}`);
});

