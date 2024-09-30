const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');

const handleLogout = async (req, res) => {
    //don't forget to delete accessToken on frontend

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    try {
        //make sure user is in database
        var poolConnection = await sql.connect(sqlConfig);
        const sqlReq = await poolConnection.request();
        sqlReq.input('token', sql.VarChar, refreshToken);
        const sqlRes = await sqlReq.query(`SELECT USERNAME
            FROM Users
            WHERE REFRESH=@token`);

        //no user found somehow
        if (sqlRes.recordset.length === 0)  {
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                secure: true
            });
            return res.sendStatus(204);
        }

        //delete refrsh token in db
        const deleteReq = await poolConnection.request();
        deleteReq.input('token', sql.VarChar, refreshToken);
        await deleteReq.query(`UPDATE Users
            SET REFRESH=NULL
            WHERE REFRESH=@token`);
        await poolConnection.close();
        
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'None',
            secure: true
        });
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleLogout };