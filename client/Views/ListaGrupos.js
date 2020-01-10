import React from "react";
import {
    Text,
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { Notifications } from "expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import { alertTimeout, checkUpdates, getGrupos, getApis } from "../Utility/Api";

class ListaGrupos extends React.PureComponent {
    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const datosRecibidos = navigation.getParam('datos', []);
        const datos = this.formatDatos(datosRecibidos);

        this.state = {
            datos: datos,
            isFetching: false,
            spinner: false
        };
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
        checkUpdates();
        this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }

    componentWillUnmount() {
        this._notificationSubscription && this._notificationSubscription.remove();
    }

    goBack = () => {
        this.props.navigation.goBack();
    }

    _handleNotification = (notification) => {
        if (this.props.isFocused) {
            this._onRefresh();
        }
    }

    setSpinnerVisible = (visible) => {
        this.setState({
            spinner: visible
        });
    }

    _onPressItem = (id, title) => {
        if (id && id != '' && id >= 0) {
            let myThis = this;
            this.setSpinnerVisible(true);
            getApis(id, function (respuesta) {
                myThis.setSpinnerVisible(false);
                if (respuesta && Array.isArray(respuesta)) {
                    myThis.props.navigation.navigate('ListaServicios', {
                        idGrupo: id,
                        arrayServicios: respuesta,
                        refresh: myThis._onRefresh,
                        title: title
                    });
                } else if (respuesta && respuesta.error) {
                    setTimeout(() => {
                        Alert.alert(
                            'Error',
                            respuesta.error,
                            [
                                { text: 'Reintentar', onPress: () => { myThis._onPressItem(id, title); } },
                                { text: 'OK', onPress: () => { } }
                            ],
                            { cancelable: false }
                        );
                    }, alertTimeout);
                } else {
                    setTimeout(() => {
                        Alert.alert(
                            'Error',
                            'Error en la comunicación con el servidor (-202)',
                            [
                                { text: 'Reintentar', onPress: () => { myThis._onPressItem(id, title); } },
                                { text: 'OK', onPress: () => { } }
                            ],
                            { cancelable: false }
                        );
                    }, alertTimeout);
                }
            }, function (error) {
                myThis.setSpinnerVisible(false);
                setTimeout(() => {
                    Alert.alert(
                        'Error',
                        'Error en la comunicación con el servidor (-203)',
                        [
                            { text: 'Reintentar', onPress: () => { myThis._onPressItem(id, title); } },
                            { text: 'OK', onPress: () => { } }
                        ],
                        { cancelable: false }
                    );
                }, alertTimeout);
            });
        }
    }

    _onRefresh = () => {
        let myThis = this;
        checkUpdates();

        myThis.setState({ isFetching: true }, function () {
            getGrupos(function (grupos) {
                myThis.setState({
                    datos: myThis.formatDatos(grupos),
                    isFetching: false
                });
            }, function (error) {
                myThis.setState({
                    isFetching: false
                });
                setTimeout(() => {
                    Alert.alert(
                        'Error',
                        'Error en la comunicación con el servidor (-201)',
                        [
                            { text: 'Reintentar', onPress: () => { myThis._onRefresh(); } },
                            { text: 'OK', onPress: () => { } }
                        ],
                        { cancelable: false }
                    );
                }, alertTimeout);
            });
        });
    }

    formatDatos(datos) {
        let datosFormatted = [];
        let totalServicios = 0;
        if (datos.length > 0) {
            for (let i = 0; i < datos.length; i++) {
                if (datos[i].fixed == 1 || datos[i].pending > 0) {
                    const name = datos[i].name;
                    const descripcion = name + ' (' + datos[i].pending + ')';
                    datosFormatted.push({
                        key: "" + i,
                        id: datos[i].id,
                        name: name,
                        descripcion: descripcion,
                        fixed: datos[i].fixed == 1 ? true : false
                    });
                    totalServicios += datos[i].pending;
                }
            }
        } else {
            datosFormatted.push({
                key: '0',
                descripcion: 'No tienes grupos con servicios pendientes!'
            });
        }

        if (Platform.OS.toLocaleLowerCase() === 'ios') {
            Notifications.setBadgeNumberAsync(totalServicios);
        }
        return datosFormatted;
    }

    _renderItem = ({ item }) => {
        return (
            <View style={styles.fila} key={item.key}>
                <ListItem
                    key={item.key}
                    id={item.id}
                    title={item.descripcion}
                    name={item.name}
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
            title: 'Grupos pendientes',
            headerLeft: navigation.getParam("headerLeft", auxHeaderLeft),
            headerRight: navigation.getParam("headerRight", auxHeaderRight)
        };
    }
}

class ListItem extends React.PureComponent {
    _onPress = () => {
        this.props.onPressItem(this.props.id, this.props.name);
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
        backgroundColor: '#ff8c8c',
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

export default withNavigationFocus(ListaGrupos);
