const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const bodyParser = require('body-parser');
const serviceAccount = require('./secondpundit-firebase-adminsdk-rqzse-fd2fbcf514.json'); // Path to your Firebase service account key

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://secondpundit-default-rtdb.firebaseio.com'
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/generateCustomToken', async (req, res) => {
    const { email, uid } = req.body;

    if (!uid || !email) {
        return res.status(400).json({ error: 'UID and email are required' });
    }

    try {
        // Check if the email is already registered
        const userRecord = await admin.auth().getUserByEmail(email);

        if (userRecord) {
            // If the email is already registered, generate a token for this user
            const token = await admin.auth().createCustomToken(uid);
            return res.json({ token });
        }
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            // If email is not registered, proceed to generate custom token
            try {
                const token = await admin.auth().createCustomToken(uid);
                return res.json({ token });
            } catch (error) {
                console.error('Error creating custom token:', error);
                return res.status(500).json({ error: 'Error generating custom token' });
            }
        } else {
            // Other errors
            console.error('Error fetching user data:', error);
            return res.status(500).json({ error: 'Error checking user' });
        }
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
