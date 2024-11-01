const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.status(400).json({ 'message': 'Username and password are both required!'});

    try {
        //find user in db
        var poolConnection = await sql.connect(sqlConfig);
        const sqlReq = await poolConnection.request();
        sqlReq.input('user', sql.VarChar, user);
        const sqlRes = await sqlReq.query(`SELECT USERNAME as UserName, PASSWORD as Pass
            FROM Users
            WHERE USERNAME=@user`);
        

        if (sqlRes.recordset.length === 0) return res.sendStatus(401);

        //check if password matches
        const match = await bcrypt.compare(pass, sqlRes.recordset[0].Pass);
        if (match) {
            //create JWTs
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": sqlRes.recordset[0].UserName
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m'}
            );
            
            const refreshToken = jwt.sign(
                { "username" : sqlRes.recordset[0].UserName },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            //save refreshtoken into db
            const updateReq = await poolConnection.request();
            updateReq.input('token', sql.VarChar, refreshToken);
            updateReq.input('user', sql.VarChar, user);
            await updateReq.query(`UPDATE Users
                SET REFRESH=@token
                WHERE USERNAME=@user`);
            await poolConnection.close();

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            res.json({ accessToken });
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleLogin };