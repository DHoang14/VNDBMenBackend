require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http')
const app = express();
const cors = require('cors');
const corsOptions = require('../config/corsOptions');
const creds = require('../middleware/creds');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3500;

app.use(creds);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/.netlify/functions/server/register', require('../routes/register'));
app.use('/.netlify/functions/server/auth', require('../routes/auth'));
app.use('/.netlify/functions/server/refresh', require('../routes/refresh'));
app.use('/.netlify/functions/server/logout', require('../routes/logout'));
app.use('/.netlify/functions/server/comments', require('../routes/api/comments'));
app.use('/.netlify/functions/server/forgotPassword', require('../routes/forgotPassword'));
app.use('/.netlify/functions/server/reset', require('../routes/resetToken'));
app.use('/.netlify/functions/server/updatePassword', require('../routes/updatePassword'));

app.all('*', (req, res) => {
    res.status(404);
    res.type('txt').send("404 NOT FOUND");
});

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports.handler = serverless(app)
