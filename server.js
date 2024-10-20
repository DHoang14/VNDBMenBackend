require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const creds = require('./middleware/creds');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3500;

app.use(creds);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/comments', require('./routes/api/comments'));
app.use('/forgotPassword', require('./routes/forgotPassword'));
app.use('/reset', require('./routes/resetToken'));
app.use('/updatePassword', require('./routes/updatePassword'));

app.all('*', (req, res) => {
    res.status(404);
    res.type('txt').send("404 NOT FOUND");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

