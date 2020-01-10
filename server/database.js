const mysql = require('mysql');

const db_config = {
    database: 'censored',
    host: 'censored',
    user: 'censored',
    password: 'censored'
};

exports.db_config = db_config;
var mysqlPool = mysql.createPool(db_config);


exports.getUser_username = function (res, username, callback) { //Busca un usuario por username
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('SELECT * FROM users WHERE Username=?', [username], function (err, rows) {
                if (!err) {
                    if (rows.length > 0) {
                        callback(rows[0]);
                    } else {
                        callback(null);
                    }
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                }
                db.release();
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.getUser_id = function (res, id, callback) { //Busca un usuario por id
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('SELECT * FROM users WHERE id=?', [id], function (err, rows) {
                if (!err) {
                    if (rows.length > 0) {
                        callback(rows[0]);
                    } else {
                        callback(null);
                    }
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                }
                db.release();
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.getUser_groups = function (res, id, callback) { //Busca los grupos de un usuario
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('SELECT users_groups.idGroups as id, groups.name, groups.fixed, COUNT(apis.id) as pending FROM groups LEFT JOIN users_groups ON groups.id = users_groups.idGroups LEFT JOIN apis ON groups.id = apis.idGroup WHERE idUser = ? GROUP BY users_groups.idGroups', [id], function (err, rows) {
                if (!err) {
                    if (rows.length > 0) {
                        callback(rows);
                    } else {
                        callback(null);
                    }
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                }
                db.release();
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.getGroup_apis = function (res, id, callback) { //Busca las apis de un grupo
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('SELECT * FROM `apis` WHERE `idGroup` = ?', [id], function (err, rows) {
                if (!err) {
                    if (rows.length > 0) {
                        callback(rows);
                    } else {
                        callback(null);
                    }
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                }
                db.release();
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.createGroup = function (res, name, fixed, idUser, callback) { //Crea un grupo
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('INSERT INTO groups(name, fixed) VALUES(?,?)', [name, fixed], function (err, resultGroups) {
                if (!err) {
                    db.query('INSERT INTO users_groups(idUser, idGroups) VALUES(?,?)', [idUser, resultGroups.insertId], function (err, result) {
                        if (!err) {
                            callback(result);
                        } else {
                            console.log(err.message);
                            res.status(200);
                            res.send({ 'error': 'Problema con la base de datos' });
                        }
                        db.release();
                    });
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                    db.release();
                }
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.createApi = function (res, idGroup, name, method, url, queryParameters, bodyParameters, body, fixed, idUser, callback) { //Crea una api
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('INSERT INTO apis(idGroup, name, method, url, queryParameters, bodyParameters, body, fixed,) VALUES(?,?)', [idGroup, name, method, url, queryParameters, bodyParameters, body, fixed,], function (err, result) {
                if (!err) {
                    callback(result);
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                    db.release();
                }
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.editGroup = function (res, idGroup, name, fixed, callback) { //Edita un grupo
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('UPDATE apis SET(idGroup=?, name=?, fixed=?,) VALUES(?,?)', [idGroup, name, fixed], function (err, result) {
                if (!err) {
                    callback(result);
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                    db.release();
                }
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.editApi = function (res, idGroup, name, method, url, queryParameters, bodyParameters, body, fixed, idUser, callback) { //Edita un grupo
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('UPDATE apis SET(idGroup=?, name=?, method=?, url=?, queryParameters=?, bodyParameters=?, body=?, fixed=?,) VALUES(?,?)', [idGroup, name, method, url, queryParameters, bodyParameters, body, fixed, idUser], function (err, result) {
                if (!err) {
                    callback(result);
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                    db.release();
                }
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.deleteGroup = function (res, idGroup, callback) { //Crea un grupo
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('DELETE FROM groups WHERE id = ?', [idGroup], function (err, result) {
                if (!err) {
                    callback(result);
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                    db.release();
                }
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}

exports.deleteApi = function (res, idApi, callback) { //Crea un grupo
    mysqlPool.getConnection(function (err, db) {
        if (!err) {
            db.query('DELETE FROM apis WHERE id = ?', [idApi], function (err, result) {
                if (!err) {
                    callback(result);
                } else {
                    console.log(err.message);
                    res.status(200);
                    res.send({ 'error': 'Problema con la base de datos' });
                    db.release();
                }
            });
        } else {
            console.log(err.message);
            res.status(200);
            res.send({ 'error': 'Problema de conexión con la base de datos' });
        }
    });
}