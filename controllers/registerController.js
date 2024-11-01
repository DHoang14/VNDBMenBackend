const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');
const bcrypt = require('bcryptjs');

const handleNewUser = async (req, res) => {
    const { user, pass, email } = req.body;
    if (!user || !pass || !email) return res.status(400).json({ 'message' : 'Username, email and password are all required!'});
    
    try {
        var poolConnection = await sql.connect(sqlConfig);
    
        //check for duplicate usernames in db
        const duplicateReq = await poolConnection.request();
        duplicateReq.input('user', sql.VarChar, user);
        duplicateReq.input('email', sql.VarChar, email);
        const duplicateRes = await duplicateReq.query(`SELECT USERNAME as username, EMAIL as email
            FROM Users
            WHERE USERNAME=@user OR EMAIL=@email`);
        
        if (duplicateRes.recordset.length > 0) return res.status(409).json({ 
            "message": `${user === duplicateRes.recordset[0].username? "Username ":""}${email === duplicateRes.recordset[0].email? "Email":""} are already taken.`});
        const hashedPass = await bcrypt.hash(pass, 10);

        //create new user
        const sqlReq = await poolConnection.request();
        sqlReq.input('user', sql.VarChar, user);
        sqlReq.input('pass', sql.Char(60), hashedPass);
        sqlReq.input('email', sql.VarChar, email)
        await sqlReq.query(`INSERT INTO Users (USERNAME, PASSWORD, EMAIL)
            VALUES (@user, @pass, @email)`);
            
        await poolConnection.close();
        res.status(201).json({ 'success' : `New user ${user} created!`});
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { handleNewUser };