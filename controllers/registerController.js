const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.status(400).json({ 'message' : 'Username and password are both required!'});
    
    try {
        var poolConnection = await sql.connect(sqlConfig);
    
        //check for duplicate usernames in db
        const duplicateReq = await poolConnection.request();
        duplicateReq.input('user', sql.VarChar, user);
        const duplicateRes = await duplicateReq.query(`SELECT USERNAME
            FROM Users
            WHERE USERNAME=@user`);
        
        if (duplicateRes.recordset.length > 0) return res.sendStatus(409);
        const hashedPass = await bcrypt.hash(pass, 10);

        //create new user
        const sqlReq = await poolConnection.request();
        sqlReq.input('user', sql.VarChar, user);
        sqlReq.input('pass', sql.Char(60), hashedPass);
        await sqlReq.query(`INSERT INTO Users (USERNAME, PASSWORD)
            VALUES (@user, @pass)`);
            
        await poolConnection.close();
        res.status(201).json({ 'success' : `New user ${user} created!`});
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };