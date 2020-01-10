const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());


// FICHEROS USADOS
const auth = require('./auth.js');
const user = require('./user.js');


// INICIALIZAR RUTAS
const router = express.Router();
router.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);


// DEFINIR RUTAS
app.use('/', express.static('web')); // Pagina principal del server
app.post('/login', auth.login); // Login mediante user/password

app.get('/users/:id/groups', auth.checkToken, user.getGroups); // Lista las colecciones de un usuario
app.post('/users/:id/group', auth.checkToken, user.createGroup); // Crea una coleccion para un usuario
app.put('/users/:id/groups/:idGroup', auth.checkToken, user.editGroup); // Edita una coleccion para un usuario
app.delete('/users/:id/groups/:idGroup', auth.checkToken, user.deleteGroup); // Elimina una coleccion para un usuario

app.get('/users/:id/groups/:idGroup/apis', auth.checkToken, user.getApis); // Lista los servicios web pertenecientes a una coleccion
app.post('/users/:id/groups/:idGroup/api', auth.checkToken, user.createApi); // Crea un servicio para un grupo
app.put('/users/:id/groups/:idGroup/apis/:idApi', auth.checkToken, user.editApi); // Edita un servicio para un grupo
app.delete('/users/:id/groups/:idGroup/apis/:idApi', auth.checkToken, user.deleteApi); // Elimina un servicio para un grupo


app.listen(3000, function () {
    console.log('Servidor express iniciado!');
});

module.exports = app;