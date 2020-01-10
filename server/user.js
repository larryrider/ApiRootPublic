const database = require('./database');


exports.getGroups = function (req, res) {
    const idUser = req.params.id;
    database.getUser_groups(res, idUser, function (rows) {
        if (rows != null) {
            if (rows.length == 0 || (rows.length > 0 && rows[0].id == null)) {
                res.status(200);
                res.send(new Array());
            } else {
                res.status(200);
                res.send(rows);
            }
        } else {
            res.status(200);
            res.send(new Array());
        }
    });
}

exports.createGroup = function (req, res) {
    const idUser = req.params.id;
    const name = req.body.name;
    const fixed = req.body.fixed;
    console.log(req.body);
    if (name && fixed && idUser) {
        database.createGroup(res, name, fixed, idUser, function (result) {
            res.status(200);
            res.send({ 'error': result });
        });
    } else {
        var errorName = (!name) ? ' (El nombre del grupo no ha sido establecido)' : '';
        var errorFixed = (!fixed) ? ' (El parámetro "fijo" no ha sido establecido)' : '';
        res.status(200);
        res.send({ 'error': 'Error al crear grupo' + errorName + errorFixed });
    }
}

exports.editGroup = function (req, res) {
    const idUser = req.params.id;
    const idGroup = req.params.idGroup;
    const name = req.body.name;
    const fixed = req.body.fixed;
    console.log(req.body);
    if (name && fixed && idUser) {
        database.editGroup(res, idGroup, name, fixed, idUser, function (result) {
            res.status(200);
            res.send({ 'error': result });
        });
    } else {
        var errorName = (!name) ? ' (El nombre del grupo no ha sido establecido)' : '';
        var errorFixed = (!fixed) ? ' (El parámetro "fijo" no ha sido establecido)' : '';
        res.status(200);
        res.send({ 'error': 'Error al editar grupo' + errorName + errorFixed });
    }
}

exports.deleteGroup = function (req, res) {
    const idUser = req.params.id;
    const idGroup = req.params.idGroup;
    console.log(req.body);
    if (name && fixed && idUser) {
        database.deleteGroup(res, idGroup, idUser, function (result) {
            res.status(200);
            res.send({ 'error': result });
        });
    } else {
        res.status(200);
        res.send({ 'error': 'Error al crear grupo' + errorName + errorFixed });
    }
}

exports.getApis = function (req, res) {
    const idGroup = req.params.idGroup;
    database.getGroup_apis(res, idGroup, function (rows) {
        if (rows != null) {
            if (rows.length == 0 || (rows.length > 0 && rows[0].id == null)) {
                res.status(200);
                res.send(new Array());
            } else {
                res.status(200);
                res.send(rows);
            }
        } else {
            res.status(200);
            res.send(new Array());
        }
    });
}

exports.createApi = function (req, res) {
    const idUser = req.params.id;
    const name = req.body.name;
    const method = req.body.method;
    const url = req.body.url;
    const queryParameters = req.body.queryParameters;
    const bodyParameters = req.body.bodyParameters;
    const body = req.body.body;
    const fixed = req.body.fixed;
    if (name && fixed && idUser) {
        database.createApi(res, idUser, name, method, url, queryParameters, bodyParameters, body, fixed, function (result) {
            res.status(200);
            res.send({ 'result': result });
        });
    } else {
        var errorName = (!name) ? ' (El nombre del grupo no ha sido establecido)' : '';
        var errorFixed = (!fixed) ? ' (El parámetro "fijo" no ha sido establecido)' : '';
        res.status(200);
        res.send({ 'error': 'Error al crear grupo' + errorName + errorFixed });
    }
}

exports.editApi = function (req, res) {
    const idUser = req.params.id;
    const name = req.body.name;
    const method = req.body.method;
    const url = req.body.url;
    const queryParameters = req.body.queryParameters;
    const bodyParameters = req.body.bodyParameters;
    const body = req.body.body;
    const fixed = req.body.fixed;
    console.log(req.body);
    if (name && fixed && idUser) {
        database.editApi(res, idUser, name, method, url, queryParameters, bodyParameters, body, fixed, function (result) {
            res.status(200);
            res.send({ 'result': result });
        });
    } else {
        var errorName = (!name) ? ' (El nombre del grupo no ha sido establecido)' : '';
        var errorFixed = (!fixed) ? ' (El parámetro "fijo" no ha sido establecido)' : '';
        res.status(200);
        res.send({ 'error': 'Error al editar grupo' + errorName + errorFixed });
    }
}

exports.deleteApi = function (req, res) {
    const idUser = req.params.id;
    const idApi = req.params.idApi;
    console.log(req.body);
    if (idApi) {
        database.deleteApi(res, idApi, idUser, function (result) {
            res.status(200);
            res.send({ 'result': result });
        });
    } else {
        res.status(200);
        res.send({ 'error': 'Error al eliminar api'});
    }
}
