import React from "react";
import {
    Text,
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    BackHandler,
    Alert
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { withNavigationFocus } from "react-navigation";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Notifications } from "expo";
import { getApis, alertTimeout } from "../Utility/Api";

class ListaServicios extends React.PureComponent {
    _didFocusSubscription;
    _willBlurSubscription;

    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const idGrupo = navigation.getParam('idGrupo', '-1');
        const arrayServicios = navigation.getParam('arrayServicios', []);
        let datos = this.getDatos(arrayServicios);
        this.state = {
            datos: datos,
            isFetching: false,
            idGrupo: idGrupo,
            spinner: false
        };
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload => {
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        });
    }

    componentWillUnmount() {
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
        this._notificationSubscription && this._notificationSubscription.remove();
    }

    componentWillMount() {
        this.props.navigation.setParams({
            headerLeft: (
                <TouchableOpacity
                    style={{ paddingHorizontal: 15 }}
                    onPress={() => { this.goBack(); }} >
                    <MaterialCommunityIcons name={"arrow-left"} size={30} color="#fff" />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity
                    style={{ paddingHorizontal: 15 }}
                    onPress={() => { this._onRefresh(); }} >
                    <MaterialCommunityIcons name={"reload"} size={30} color="#fff" />
                </TouchableOpacity>
            )
        });
    }

    componentDidMount() {
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
        this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }

    _handleNotification = (notification) => {
        if (this.props.isFocused) {
            this._onRefresh();
        }
    }

    onBackButtonPressAndroid = () => {
        this.props.navigation.state.params.refresh();
    }

    goBack = () => {
        this.onBackButtonPressAndroid();
        this.props.navigation.goBack();
    }

    _onPressItem = (id) => {
        setTimeout(() => {
            Alert.alert(
                'Has pulsado\n\n',
                'ID: ' + id + '.\n',
                [
                    { text: 'OK', onPress: () => { } }
                ],
                { cancelable: false }
            )
        }, alertTimeout);
    }

    _onRefresh = () => {
        let myThis = this;
        myThis.setState({ isFetching: true }, function () {
            getApis(myThis.state.idGrupo, function (respuesta) {
                if (respuesta && Array.isArray(respuesta)) {
                    let datos = myThis.getDatos(respuesta);
                    myThis.setState({
                        datos: datos,
                        isFetching: false
                    });
                }  else {
                    myThis.setState({
                        datos: myThis.getDatos([]),
                        isFetching: false
                    });
                    setTimeout(() => {
                        Alert.alert(
                            'Error',
                            'Error en la comunicación con el servidor (-401)',
                            [
                                { text: 'Reintentar', onPress: () => { myThis._onRefresh(); } },
                                { text: 'OK', onPress: () => { } }
                            ],
                            { cancelable: false }
                        );
                    }, alertTimeout);
                };
            }, function (error) {
                myThis.setState({
                    datos: myThis.getDatos([]),
                    isFetching: false
                });
                setTimeout(() => {
                    Alert.alert(
                        'Error',
                        'Error en la comunicación con el servidor (-402)',
                        [
                            { text: 'Reintentar', onPress: () => { myThis._onRefresh(); } },
                            { text: 'OK', onPress: () => { } }
                        ],
                        { cancelable: false }
                    )
                }, alertTimeout);
            });
        });
    }

    setSpinnerVisible = (visible) => {
        this.setState({
            spinner: visible
        });
    }

    getDatos(arrayServicios) {
        let datos = [];
        if (arrayServicios.length > 0) {
            for (let i = 0; i < arrayServicios.length; i++) {
                datos.push({
                    key: "" + i,
                    id: arrayServicios[i].id,
                    descripcion: arrayServicios[i].name
                });
            }
        } else {
            datos.push({
                key: '0',
                descripcion: 'No tienes elementos pendientes!'
            });
        }
        return datos;
    }

    _renderItem = ({ item }) => {
        return (
            <View style={styles.fila} key={item.key}>
                <ListItem
                    key={item.key}
                    id={item.id}
                    title={item.descripcion}
                    onPressItem={this._onPressItem}
                />
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.spinner} textContent={"Cargando..."} textStyle={{ color: '#FFF' }} />
                <FlatList
                    style={styles.container}
                    data={this.state.datos}
                    renderItem={this._renderItem}
                    onRefresh={this._onRefresh}
                    refreshing={this.state.isFetching}
                />
            </View>
        );
    }

    static navigationOptions = ({ navigation }) => {
        const auxHeaderLeft = <TouchableOpacity style={{ paddingHorizontal: 15 }}>
            <MaterialCommunityIcons name={"arrow-left"} size={30} color="#fff" />
        </TouchableOpacity>;
        const auxHeaderRight = <TouchableOpacity style={{ paddingHorizontal: 15 }}>
            <MaterialCommunityIcons name={"reload"} size={30} color="#fff" />
        </TouchableOpacity>;
        return {
            title: navigation.getParam("title", "Servicio"),
            headerLeft: navigation.getParam("headerLeft", auxHeaderLeft),
            headerRight: navigation.getParam("headerRight", auxHeaderRight)
        };
    }
}

class ListItem extends React.PureComponent {
    _onPress = () => {
        this.props.onPressItem(this.props.id);
    }

    render() {
        return (
            <TouchableOpacity onPress={this._onPress} style={styles.touchable}>
                <View>
                    <Text style={styles.textoFila}>
                        {this.props.title}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    fila: {
        //width: '100%',
        backgroundColor: '#ff8c8c',
        //borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ff8c8c',
        borderBottomColor: '#fff'
    },
    textoFila: {
        fontSize: 20,
        color: '#fff'
    },
    touchable: {
        paddingBottom: 15,
        paddingTop: 15,
        paddingLeft: 15
    }
});

export default withNavigationFocus(ListaServicios);
