const sqlConfig = require('../config/databaseConfig')
const sql = require('mssql');
const { v4: uuid } = require('uuid');

const createComment = async (req, res) => {
    const { user, content } = req.body;

    if (!req?.params?.id || !user || !content) {
        return res.status(400).json({ 'message': 'Character ID, Username and Comment Content required.' });
    }

    try {
        var poolConnection = await sql.connect(sqlConfig);

        //create new comment
        const sqlReq = await poolConnection.request();
        sqlReq.input('commentID', sql.VarChar, uuid());
        sqlReq.input('characterID', sql.VarChar, req.params.id);
        sqlReq.input('user', sql.VarChar, user);
        sqlReq.input('content', sql.NVarChar, content);
        sqlReq.input('date', sql.DateTime, new Date());
        await sqlReq.query(`INSERT INTO Comments (COMMENTID, CHARACTERID, USERID, CONTENT, DATE)
            VALUES (@commentID, @characterID, @user, @content, @date)`);

        await poolConnection.close();

        res.status(201).json({'message': 'Comment sucessfully created'});
    }
    catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const getComments = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'Character ID required.' });

    try {
        //find comments for specified character
        var poolConnection = await sql.connect(sqlConfig);
        const sqlReq = await poolConnection.request();
        sqlReq.input('characterID', sql.VarChar, req.params.id);
        const sqlRes = await sqlReq.query(`SELECT CONTENT, USERID, DATE
            FROM Comments
            WHERE CHARACTERID=@characterID
            ORDER BY DATE`);

        poolConnection.close();

        if (sqlRes.recordset.length === 0) return res.status(204).json({ 'message' : 'No comments found.'});

        res.json(sqlRes.recordset);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
    

}

module.exports = {
    createComment, 
    getComments
};