import React from 'react'
import Api from "../../database.js"
import { ShowCollection, EditCollection, DeleteCollection, CreateCollection } from './collection'

class Home extends React.Component {
    constructor() {
        super()

        var actions = { home: 'home', editCollection: 'editCollection', deleteCollection: 'deleteCollection', createCollection: 'createCollection', showUser: 'showUser' }

        if (localStorage.getItem('token')) {
            var login = JSON.parse(localStorage.getItem('login'))
            this.state = { logged: true, actions: actions, action: actions.home, objectAction: 'none', login: login }
        } else {
            this.state = { logged: false, actions: actions, action: actions.home, objectAction: 'none', login: '' }
        }

        this.loginOK = this.loginOK.bind(this)
        this.logoutOK = this.logoutOK.bind(this)
        this.editCollection = this.editCollection.bind(this)
        this.deleteCollection = this.deleteCollection.bind(this)
        this.createCollection = this.createCollection.bind(this)
        this.showUser = this.showUser.bind(this)
        this.changeLogin = this.changeLogin.bind(this)
    }

    loginOK() {
        var login = JSON.parse(localStorage.getItem('login'))
        this.setState({ logged: true, action: this.state.actions.home, objectAction: 'none', login: login })
    }

    logoutOK() {
        this.setState({ logged: false, action: this.state.actions.home, objectAction: 'none', login: '' })
        localStorage.removeItem('token')
        localStorage.removeItem('login')
    }

    editCollection(collection) {
        if (collection) {
            this.setState({ action: this.state.actions.editCollection, objectAction: collection })
        } else {
            this.setState({ action: this.state.actions.home, objectAction: 'none' })
        }
    }

    deleteCollection(collection) {
        if (collection) {
            this.setState({ action: this.state.actions.deleteCollection, objectAction: collection })
        } else {
            this.setState({ action: this.state.actions.home, objectAction: 'none' })
        }
    }

    createCollection(create) {
        if (create) {
            this.setState({ action: this.state.actions.createCollection, objectAction: create })
        } else {
            this.setState({ action: this.state.actions.home, objectAction: 'none' })
        }
    }

    showUser(user) {
        if (user) {
            this.setState({ action: this.state.actions.showUser, objectAction: user })
        } else {
            this.setState({ action: this.state.actions.home, objectAction: 'none' })
        }
    }

    changeLogin(login) {
        this.setState({ login: login })
    }

    componentDidMount() {
        if (this.state.logged) {
            try {
                var token = localStorage.getItem('token')
                var login = JSON.parse(localStorage.getItem('login'))
            } catch (e) {
                console.log(e)
                this.logoutOK()
            } finally {
                if (!token || !login || token == null || login == null) {
                    this.logoutOK()
                }
            }
        }
    }

    render() {
        if (!this.state.logged) {
            document.getElementById('body').style.backgroundSize = "cover"
            document.getElementById('body').style.backgroundImage = "url(../css/media/background_login.jpg)"

            return <Auth handleLoginOK={this.loginOK} />
        } else {
            document.getElementById('body').style.backgroundSize = "cover"
            document.getElementById('body').style.backgroundImage = "url(../css/media/background_home.jpg"
            //document.getElementById('body').style.backgroundColor = "#fafafa"

            var login = this.state.login

            switch (this.state.action) {
                case (this.state.actions.editCollection):
                    var style = { 'backgroundColor': 'coral' }
                    var title = <h4>Editar Coleccion</h4>
                    var panel = <EditCollection collection={this.state.objectAction} editCollection={this.editCollection} handleLogoutOK={this.logoutOK} />
                    break
                case (this.state.actions.deleteCollection):
                    var style = { 'backgroundColor': 'indianred' }
                    var title = <h4>¿Eliminar colección?</h4>
                    var panel = <DeleteCollection collection={this.state.objectAction} deleteCollection={this.deleteCollection} handleLogoutOK={this.logoutOK} />
                    break
                case (this.state.actions.createCollection):
                    var style = { 'backgroundColor': 'steelblue' }
                    var title = <h4>Crear Nueva Coleccion</h4>
                    var panel = <CreateCollection createCollection={this.createCollection} handleLogoutOK={this.logoutOK} />
                    break
                case (this.state.actions.showUser):
                    var style = { 'backgroundColor': 'mediumaquamarine' }
                    var title = <h4>Mi perfil</h4>
                    var user = { id: login.id, username: login.username, countCollections: $('.collection').length }
                    var panel = <ShowUser showUser={this.showUser} user={user} handleLogoutOK={this.logoutOK} changeLogin={this.changeLogin} />
                    break
                case (this.state.actions.home):
                default:
                    var style = { 'backgroundColor': 'mediumpurple' }
                    var title = <h4>Colecciones de {login.username}</h4>
                    var panel = <Collections editCollection={this.editCollection} deleteCollection={this.deleteCollection} handleLogoutOK={this.logoutOK} />
            }

            return <div>
                <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <a className="navbar-brand" href="/"><img src="../css/media/tfg.png" className="img-navbar" alt="TFG"></img></a>
                            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                        </div>
                        <div className="collapse navbar-collapse" id="myNavbar">
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <a onClick={this.createCollection} href="#"><span className="glyphicon glyphicon-cloud-upload"></span> Crear nueva coleccion</a>
                                </li>
                                <li className="dropdown"><a href="#" className="dropdown-toggle" data-toggle="dropdown">Bienvenido, {login.username} <b className="caret"></b></a>
                                    <ul id="dropDown" className="dropdown-menu">
                                        <li><a onClick={this.showUser} href="#"><i className="glyphicon glyphicon-user"></i> Mi perfil</a></li>
                                        <li className="divider"></li>
                                        <li><a onClick={this.logoutOK} href=""><i className="glyphicon glyphicon-log-out"></i> Cerrar sesión</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <section>
                    <div className="container gal-container">
                        <div className="panel panel-default">
                            <div id="panelHeading" className="panel-heading" style={style}>{title}</div>
                            <div className="panel-body">
                                {panel}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        }
    }
}

class Collections extends React.Component {
    constructor(props) {
        super(props)
        this.state = { collections: [] }
    }

    componentDidMount() {
        try {
            var token = localStorage.getItem('token')
            var login = JSON.parse(localStorage.getItem('login'))
        } catch (e) {
            console.log(e)
            this.props.handleLogoutOK()
        } finally {
            if (!token || !login || token == null || login == null) {
                this.props.handleLogoutOK()
            }
        }
        try {
            var state = this
            new Api().getCollections(token, login.id).then(function (result) {
                console.log(result)
                if (result && result[0] && result[0][0] && result[0][0].id) {
                    var collections = []
                    for (var i = 0; i < result.length - 1; i++) { //resto 1 para quitar el hipermedia
                        collections.push(result[i])
                    }
                    state.setState({ collections: collections })
                } else if (result && result.message && result.message == "No tienes colecciones") {
                    state.setState({ collections: [] })
                    document.getElementById('errorCollections').innerHTML = ""
                } else if (result && result.error) {
                    state.setState({ collections: [] })
                    document.getElementById('errorCollections').innerHTML = result.error
                } else {
                    state.setState({ collections: [] })
                    document.getElementById('errorCollections').innerHTML = "Error desconocido"
                }
            }).catch(function () {
                document.getElementById('errorCollections').innerHTML = "Error de conexion con la api (¿Está en funcionamiento?)"
            })
        } catch (e) {
        }
    }

    render() {
        var collections = []
        if (this.state.collections.length > 0) {
            for (var i = 0; i < this.state.collections.length; i++) {
                collections.push(<ShowCollection key={i}
                    idCollection={this.state.collections[i][0].id}
                    title={this.state.collections[i][0].title}
                    editCollection={this.props.editCollection}
                    deleteCollection={this.props.deleteCollection} />)
            }
        } else {
            collections = <center><h3>No tienes colecciones</h3>
                <p></p><h5 id="errorCollections"></h5>
            </center>
        }
        return collections
    }
}

export default Home