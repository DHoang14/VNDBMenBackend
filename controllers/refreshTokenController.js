const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    try {
        //find refresh token
        var poolConnection = await sql.connect(sqlConfig);
        const sqlReq = await poolConnection.request();
        sqlReq.input('token', sql.Text, refreshToken);
        const sqlRes = await sqlReq.query(`SELECT USERNAME as UserName
            FROM Users
            WHERE REFRESH=@token`);
        await poolConnection.close();

        if (sqlRes.recordset.length === 0) return res.sendStatus(403);
        
        //evaluate jwt
        jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET, 
            (err, decoded) => {
                if (err || decoded.username !== sqlRes.recordset[0].UserName) return res.sendStatus(403);
                const accessToken = jwt.sign(
                    {
                        "UserInfo": {
                            "username" : decoded.username
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '15m'}
                );
                res.json({accessToken});
            }
        );
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleRefreshToken };