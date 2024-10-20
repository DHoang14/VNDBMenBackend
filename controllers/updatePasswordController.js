const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');
const bcrypt = require('bcrypt');

const handleUpdatePassword = async (req, res) => {
    const { user, newPassword, resetToken } = req.body;
    try {
        var poolConnection = await sql.connect(sqlConfig);
        const sqlReq = await poolConnection.request();
        sqlReq.input('user', sql.VarChar, user);
        sqlReq.input('resetToken', sql.VarChar, resetToken);
        const sqlRes = await sqlReq.query(`SELECT RESETTOKENEXPIRATION as expiration
            FROM Users
            WHERE RESETTOKEN=@resetToken AND USERNAME=@user`);
        
        if (sqlRes.recordset.length === 0) return res.status(403).json({ 'message': 'No account associated with the given reset token and username.'});

        //verify expiration has not passed
        const expiration = new Date(sqlRes.recordset[0].expiration).valueOf();
        if (new Date().valueOf() < expiration) {
            //reset token is still valid
            //reset password
            const hashedPass = await bcrypt.hash(newPassword, 10);
            const updateReq = await poolConnection.request();
            updateReq.input('user', sql.VarChar, user);
            updateReq.input('pass', sql.Char(60), hashedPass);
            await updateReq.query(`UPDATE Users
                SET PASSWORD=@pass, RESETTOKEN=NULL, RESETTOKENEXPIRATION=NULL
                WHERE USERNAME=@user`);

            res.status(200).json({ 'message': "Password has been successfully reset."})
            
        } else {
            res.status(403).json({ 'message': 'Reset token has expired and cannot be used to reset password.'})
        }
        poolConnection.close();
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleUpdatePassword };