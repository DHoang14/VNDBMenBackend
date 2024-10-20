const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');

const handleResetToken = async (req, res) => {
    if (!req?.params?.token) return res.status(400).json({ 'message': 'Reset token required to verify if reset link is still valid.'});

    try {
        var poolConnection = await sql.connect(sqlConfig);
        const sqlReq = await poolConnection.request();
        sqlReq.input('resetToken', sql.VarChar, req.params.token);
        const sqlRes = await sqlReq.query(`SELECT RESETTOKENEXPIRATION as expiration, USERNAME as username
            FROM Users
            WHERE RESETTOKEN=@resetToken`);
        poolConnection.close();

        if (sqlRes.recordset.length === 0) return res.status(403).json({ 'message': 'No account associated with the given reset token.'});

        //verify expiration has not passed
        const expiration = new Date(sqlRes.recordset[0].expiration).valueOf();
        if (new Date().valueOf() < expiration) {
            res.status(200).json({ 'user': sqlRes.recordset[0].username });
        } else {
            res.status(403).json({ 'message': 'Reset token has expired and cannot be used to reset password.'})
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleResetToken };