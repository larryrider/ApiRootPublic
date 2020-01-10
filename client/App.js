import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Login from "./Views/Login";
import ListaGrupos from "./Views/ListaGrupos";
import ListaServicios from "./Views/ListaServicios";

const App = createStackNavigator(
    {
        Login: { screen: Login },
        ListaGrupos: { screen: ListaGrupos },
        ListaServicios: { screen: ListaServicios },
    },
    {
        initialRouteName: 'Login',
        defaultNavigationOptions: {
            headerTintColor: '#FFF',
            headerStyle: {
                backgroundColor: '#FF6161',
                borderWidth: 0,
                borderBottomWidth: 3,
                borderBottomColor: 'white'
            }
        }
    }
);

const AppContainer = createAppContainer(App);

export default AppContainer;
