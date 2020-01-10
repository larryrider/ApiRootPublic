
const jwt = require('jwt-simple');
const moment = require('moment');

const database = require('./database.js');

const secret = 'TFG_larg1@alu.ua.es_TFG';

exports.createToken = createToken = function (id, user) {
    var payload = {
        id: id,
        username: user,
        iat: moment().unix(),
        exp: moment().add(7, "days").unix(),
    };
    return jwt.encode(payload, secret);
}

exports.login = function (req, res) { // Login usando user/password
    const username = req.body.username;
    const password = req.body.password;
    console.log(req.body);
    if (username && password && password != "") {
        database.getUser_username(res, username, function (user) {
            if (user != null) {
                if (username != user.username) {
                    res.status(200);
                    res.send({ 'error': 'Credenciales incorrectas' });
                } else if (password != user.password) {
                    res.status(200);
                    res.send({ 'error': 'Credenciales incorrectas' });
                } else {
                    res.status(200);
                    res.send({ 'id': user.id, 'username': username, 'token': createToken(user.id, username) });
                }
            } else {
                res.status(200);
                res.send({ 'error': 'Credenciales incorrectas' });
            }
        });
    } else {
        const errorUsername = (!username) ? ' (El nombre de usuario no ha sido establecido)' : '';
        const errorPassword = (!password) ? ' (La contraseña no ha sido establecida)' : '';
        res.status(200);
        res.send({ 'error': 'Error en el login' + errorUsername + errorPassword });
    }
}

exports.checkToken = function (req, res, next) { // Middleware que comprueba que el token sea correcto para dado un usuario
    if (req.headers.authorization) {
        const token = req.headers.authorization;
        try {
            var decoded = jwt.decode(token, secret);
        } catch (e) {
            res.status(200);
            res.send({ 'errorToken': 'El token está corrupto' });
        }
        if (decoded && decoded.id && decoded.username && req.params.id) {
            if (decoded.id != req.params.id) {
                res.status(200);
                res.send({ 'errorToken': 'No tienes permisos suficientes para realizar esta operación' });
            } else if (decoded.exp <= moment.unix()) {
                res.status(200);
                res.send({ 'errorToken': 'El token ha expirado' });
            } else {
                database.getUser_id(res, decoded.id, function (user) {
                    if (user && user.id && user.username && user.id == decoded.id && user.username == decoded.username) {
                        next();
                    } else if (!user || !user.id || !user.username) {
                        res.status(200);
                        res.send({ 'errorToken': 'Hay un problema con tu usuario' });
                    } else if (user.id != decoded.id || user.username != decoded.username) {
                        res.status(200);
                        res.send({ 'errorToken': 'Hay un problema de credenciales' });
                    } else {
                        res.status(200);
                        res.send({ 'errorToken': 'Hay un problema desconocido con el token' });
                    }
                });
            }
        } else {
            res.status(200);
            res.send({ 'errorToken': 'Hay un problema con el token' });
        }
    } else {
        res.status(200);
        res.send({ 'errorToken': 'Sin cabeceras de autorizacion (Sin loguear)' });
    }
}