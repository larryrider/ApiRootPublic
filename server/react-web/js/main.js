//Este es el "archivo inicial" tal y como está configurado en webpack
//La ejecución de js comenzaría por aquí.
//importamos los componentes y los pintamos en el HTML con ReactDOM.render

import React from 'react'
import ReactDOM from 'react-dom'  
//Al ser un export default, al importarlo podemos cambiarle el nombre
import Home from './home'


ReactDOM.render(<Home/>, document.getElementById('componente'));