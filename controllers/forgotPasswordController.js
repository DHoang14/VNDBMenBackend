const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ 'message' : 'Email is required to reset password'});

    try {
        var poolConnection = await sql.connect(sqlConfig);
        const sqlReq = await poolConnection.request();
        sqlReq.input('email', sql.VarChar, email);
        const sqlRes = await sqlReq.query(`SELECT USERNAME
            FROM Users
            WHERE EMAIL=@email`);
        
        //no account associated with that email
        if (sqlRes.recordset.length === 0) return res.status(401).json({ 'message': 'No account associated with that email.'});
        
        const resetToken = crypto.randomBytes(20).toString('hex');
        const updateReq = await poolConnection.request();
        updateReq.input('email', sql.VarChar, email);
        updateReq.input('resetToken', sql.VarChar, resetToken);
        updateReq.input('resetTokenExpire', sql.DateTime, new Date(new Date().valueOf() + 3600000)); //expires in an hour
        await updateReq.query(`UPDATE Users
            SET RESETTOKEN=@resetToken, RESETTOKENEXPIRATION=@resetTokenExpire
            WHERE EMAIL=@email`);
        await poolConnection.close();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`,
                pass: `${process.env.EMAIL_PASSWORD}`
            },
        });

        const mailOptions = {
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: 'Link to Reset Password',
            text:
            `You are receiving this because you (or someone else) has requested the reset of their password.\n
            Please click on the following link, or paste this into your browser to complete the process.\n
            ${process.env.FRONTEND_ENDPOINT}/reset/${resetToken}\n
            This link expires in one hour. If you did not request this, please ignore this email and your password will remain the same.`
        };

        await transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                res.status(500).json({ 'message': err.message});
            } else {
                res.status(200).json({ 'message': 'Recovery email has been sent'});
            }
        });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleForgotPassword };