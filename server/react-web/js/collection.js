import React from 'react'
import Api from "./utils/api.js"

class ShowCollection extends React.Component {
    constructor(props) {
        super(props)
        this.editCollection = this.editCollection.bind(this)
        this.deleteCollection = this.deleteCollection.bind(this)
    }

    editCollection() {
        this.props.editCollection({
            idCollection: this.props.idCollection,
            title: this.props.title
        })
    }

    deleteCollection() {
        this.props.deleteCollection({
            idCollection: this.props.idCollection,
            title: this.props.title
        })
    }

    render() {
        var idCollection = this.props.idCollection
        var title = this.props.title
        var data_target = "#" + idCollection

        return <div className="col-md-4 col-sm-6 co-xs-12 gal-item collection">
            <div className="box">
                <a href="#" data-toggle="modal" data-target={data_target}>
                    <img style={{ 'width': '95%', 'height': 'unset', 'top': '50%', 'left': '50%', 'position': 'absolute', 'transform': 'translate(-50%,-50%)', 'maxHeight': ' 95%' }}
                        ref={img => this.img = img} className="img-gallery" />
                </a>
                <div className="modal fade" id={idCollection} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                                <h4 className="modal-title">{title}</h4>
                            </div>
                            <div className="modal-body centered-text">
                                <img alt="URL incorrecta" ref={img2 => this.img2 = img2} style={{ 'height': 'unset', 'maxWidth': '70%' }}
                                    className="img-modal" />
                            </div>
                            <div className="modal-footer">
                                <div style={{ 'float': 'right' }}>
                                    <button type="button" onClick={this.editCollection} href="#" data-dismiss="modal" className="btn btn-warning">Editar</button>
                                    <button type="button" onClick={this.deleteCollection} href="#" data-dismiss="modal" className="btn btn-danger">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

class EditCollection extends React.Component {
    constructor(props) {
        super(props)
        console.log(props.collection)

        this.state = { title: props.collection.title }

        this.guardar = this.guardar.bind(this)
        this.cancelar = this.cancelar.bind(this)
        this.handleTitle = this.handleTitle.bind(this)
    }

    guardar(event) {
        event.preventDefault()
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
            var collection = { idCollection: this.props.collection.idCollection, title: this.state.title }
            var props = this.props
            new Api().editCollection(token, login.id, collection).then(function (result) {
                console.log(result)
                if (result && result[0] && result[0].id) {
                    props.editCollection(false)
                } else if (result && result.error) {
                    document.getElementById('error').innerHTML = result.error
                } else {
                    document.getElementById('error').innerHTML = "Error desconocido"
                }
            }).catch(function () {
                document.getElementById('error').innerHTML = "Error de conexion con la api (¿Está en funcionamiento?)"
            })
        } catch (e) {
        }
    }

    cancelar() {
        this.props.editCollection(false)
    }

    handleTitle(title) {
        this.setState({ title: title.target.value })
        document.getElementById('error').innerHTML = ""
    }

    render() {
        return <form action="" onSubmit={this.guardar}>
            <div className="panel-body" style={{ 'padding': '5px' }}>
                <div className="row">
                    <div className="text-center">
                        <img className="roundedCyan" alt="URL incorrecta"
                            ref={img => this.img = img} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12" style={{ 'paddingBottom': '10px' }}>
                        <div className="form-group">
                            <label className="control-label">Título</label>
                            <div className="input-group">
                                <span className="input-group-addon"><i className="fa fa-pencil"></i></span>
                                <input onChange={this.handleTitle} className="text" className="form-control" placeholder="Introduzca un título" value={this.state.title} maxLength="50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel-footer" style={{ 'marginBottom': '-14px', 'backgroundColor': 'white' }}>
                <button type="submit" className="btn btn-success">Editar</button>
                <button onClick={this.cancelar} style={{ 'float': 'right' }} type="button" className="btn btn-danger btn-close">Cancelar</button>
            </div>
        </form>
    }
}

class DeleteCollection extends React.Component {
    constructor(props) {
        super(props)

        this.delete = this.delete.bind(this)
        this.cancelar = this.cancelar.bind(this)
    }

    delete(event) {
        event.preventDefault()
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
            var idCollection = this.props.collection.idCollection
            var props = this.props
            new Api().deleteCollection(token, login.id, idCollection).then(function (result) {
                console.log(result)
                if (result && result.message && result.message == "Borrado correctamente") {
                    props.deleteCollection(false)
                } else if (result && result.error) {
                    document.getElementById('error').innerHTML = result.error
                } else {
                    document.getElementById('error').innerHTML = "Error desconocido"
                }
            }).catch(function () {
                document.getElementById('error').innerHTML = "Error de conexion con la api (¿Está en funcionamiento?)"
            })
        } catch (e) {
        }
    }

    cancelar() {
        this.props.deleteCollection(false)
    }

    render() {
        return <form action="" onSubmit={this.delete}>
            <div className="panel-body" style={{ 'padding': '5px' }}>
                <div className="row">
                    <div className="text-center" style={{ 'paddingBottom': '10px' }}>
                        <img className="roundedRed" alt="URL incorrecta" style={{ maxWidth: '30%', height: 'auto' }}
                            ref={img => this.img = img} />
                    </div>
                </div>
                <div className="row">
                    <div className="text-center" style={{ 'paddingBottom': '10px' }}>
                        <label>Título:</label><span> </span>
                        <label> {this.props.collection.title}</label>
                    </div>
                </div>
            </div>
            <div className="panel-footer" style={{ 'marginBottom': '-14px', 'backgroundColor': 'white' }}>
                <button type="submit" className="btn btn-danger">Eliminar</button>
                <button onClick={this.cancelar} style={{ 'float': 'right' }} type="button" className="btn btn-default btn-close">Cancelar</button>
            </div>
        </form>
    }
}

class CreateCollection extends React.Component {
    constructor(props) {
        super(props)

        this.state = { title: '' }

        this.crear = this.crear.bind(this)
        this.cancelar = this.cancelar.bind(this)
        this.handleTitle = this.handleTitle.bind(this)
    }

    crear(event) {
        event.preventDefault()
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
            var collection = { title: this.state.title }
            var props = this.props
            new Api().createCollection(token, login.id, collection).then(function (result) {
                console.log(result)
                if (result && result[0] && result[0].id) {
                    props.createCollection(false)
                } else if (result && result.error) {
                    document.getElementById('error').innerHTML = result.error
                } else {
                    document.getElementById('error').innerHTML = "Error desconocido"
                }
            }).catch(function () {
                document.getElementById('error').innerHTML = "Error de conexion con la api (¿Está en funcionamiento?)"
            })
        } catch (e) {
        }
    }

    cancelar() {
        this.props.createCollection(false)
    }

    handleTitle(title) {
        this.setState({ title: title.target.value })
        document.getElementById('error').innerHTML = ""
    }

    render() {
        return <form action="" onSubmit={this.crear}>
            <div className="panel-body" style={{ 'padding': '5px' }}>
                <div className="row">
                    <div className="text-center">
                        <img className="roundedCyan" alt="URL incorrecta" style={{ maxWidth: '30%', height: 'auto' }}
                            ref={img => this.img = img} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12" style={{ 'paddingBottom': '10px' }}>
                        <div className="form-group">
                            <label className="control-label">Título</label>
                            <div className="input-group">
                                <span className="input-group-addon"><i className="fa fa-pencil"></i></span>
                                <input onChange={this.handleTitle} className="text" className="form-control" placeholder="Introduzca un título" value={this.state.title} maxLength="50" required />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel-footer" style={{ 'marginBottom': '-14px', 'backgroundColor': 'white' }}>
                <button type="submit" className="btn btn-primary">Crear Colección</button>
                <button onClick={this.cancelar} style={{ 'float': 'right' }} type="button" className="btn btn-danger btn-close">Cancelar</button>
            </div>
        </form>
    }
}

export { ShowCollection, EditCollection, DeleteCollection, CreateCollection }