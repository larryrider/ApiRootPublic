import React, { Component } from "react";
import {
    Text,
    View,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
    Linking,
    Share
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import Toast from "react-native-root-toast";
import SettingsList from "react-native-settings-list";
import { Notifications, IntentLauncherAndroid, ScreenOrientation, Updates, AppLoading } from "expo";
import Constants from "expo-constants";
import { Asset } from "expo-asset";
import * as Permissions from "expo-permissions";
import * as Localization from "expo-localization";
import * as Font from "expo-font";
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import { MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { getLogin, alertTimeout, checkUpdates, getGrupos } from "../Utility/Api";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAppReady: false,
            updating: false,
            settings: false,
            pushToken: ''
        };
    }

    async _cacheResourcesAsync() {
        const images = [
            require('../assets/logo_apiroot.png'),
            require('../assets/id.png'),
            require('../assets/information.png'),
            require('../assets/login.png'),
            require('../assets/notifications.png'),
            require('../assets/update.png')
        ];

        const fonts = [
            Feather.font,
            MaterialCommunityIcons.font,
            MaterialIcons.font
        ];

        const cacheImages = images.map((image) => {
            return Asset.fromModule(image).downloadAsync();
        });

        const cacheFonts = fonts.map((font) => {
            return Font.loadAsync(font);
        });

        await Promise.all([...cacheImages, ...cacheFonts]);
    }

    componentDidMount() {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        this.registerForPushNotificationsAsync();
        checkUpdates();
    }

    componentWillMount() {
        this.props.navigation.setParams({
            headerRight: (
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableOpacity
                        style={{ paddingRight: 18 }}
                        onPress={() => { this.showSettings(true) }} >
                        <MaterialIcons name={"settings"} size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            )
        });
    }

    registerForPushNotificationsAsync = async () => {
        const { status: existingStatus } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;

        // only ask if permissions have not already been determined, because
        // iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }

        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
            Toast.show('Sin permisos no se pueden mostrar notificaciones!', {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
                onShow: () => { },
                onShown: () => { },
                onHide: () => { },
                onHidden: () => { }
            });
            return
        } else {
            // Get the token that uniquely identifies this device
            const pushToken = await Notifications.getExpoPushTokenAsync();
            this.setState({ pushToken: pushToken });
            try {
                await SecureStore.setItemAsync('pushToken', pushToken);
            } catch (error) { }

            if (Platform.OS === 'android') {
                Notifications.createChannelAndroidAsync('apiroot', {
                    name: 'apiroot',
                    sound: true,
                    vibrate: true,
                    badge: true,
                });
            }
        }
    }

    updateApp = () => {
        this.setState({ updating: true }, () => {
            setTimeout(async () => {
                try {
                    const update = await Updates.checkForUpdateAsync();
                    if (update.isAvailable) {
                        await Updates.fetchUpdateAsync();
                        Updates.reloadFromCache();
                    } else {
                        Toast.show('No hay actualizaciones disponibles, ya tienes la última versión!', {
                            duration: Toast.durations.LONG,
                            position: Toast.positions.BOTTOM,
                            shadow: true,
                            animation: true,
                            hideOnPress: true,
                            delay: 0,
                            onShow: () => { },
                            onShown: () => { },
                            onHide: () => { },
                            onHidden: () => { }
                        });
                    }
                } catch (error) {
                    Toast.show('Ha ocurrido un error buscando actualizaciones, inténtelo de nuevo', {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.BOTTOM,
                        shadow: true,
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                        onShow: () => { },
                        onShown: () => { },
                        onHide: () => { },
                        onHidden: () => { }
                    });
                }
                this.setState({ updating: false });
            }, 1000);
        });
    }

    showSettings = (visible) => {
        this.setState({
            settings: visible
        });
    }

    showNotificationsSettings = () => {
        if (Platform.OS === 'android') {
            IntentLauncherAndroid.startActivityAsync(
                //IntentLauncherAndroid.ACTION_APP_NOTIFICATION_SETTINGS
                IntentLauncherAndroid.ACTION_APPLICATION_SETTINGS,
                { package: 'es.larryrider.apiroot' }
            );
        } else {
            Linking.openURL('app-settings:');
        }
    }

    setAutoLogin = (value) => {
        this.setState({ autoLogin: value }, async function () {
            try {
                await SecureStore.setItemAsync('autoLogin', "" + value);
            } catch (error) { }
        });
    }

    render() {
        if (!this.state.isAppReady) {
            return (
                <AppLoading
                    startAsync={this._cacheResourcesAsync}
                    onFinish={() => this.setState({ isAppReady: true })}
                    onError={console.warn}
                />
            );
        }

        const marginTop = (Platform.OS === 'android') ? 5 : 30;
        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={this.state.updating}
                    onRequestClose={() => { }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '200', color: '#d24040', marginBottom: 20 }}>
                            Actualizando...
                        </Text>
                        <ActivityIndicator size="large" color="#d24040" />
                    </View>
                </Modal>
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={this.state.settings}
                    onRequestClose={() => { this.showSettings(false); }}>
                    <View style={{ backgroundColor: '#EFEFF4', flex: 1 }}>
                        <View style={{ borderBottomWidth: 1, backgroundColor: '#ff6161', borderColor: '#c8c7cc' }}>
                            <View style={{ flexDirection: 'row', marginTop: marginTop, marginBottom: 10 }}>
                                <TouchableOpacity
                                    style={{ zIndex: 999 }}
                                    onPress={() => { this.showSettings(false); }}>
                                    <MaterialIcons name={"chevron-left"} size={40} color="#fff" />
                                </TouchableOpacity>
                                <View style={{ position: 'absolute', width: '100%' }}>
                                    <Text style={{ marginTop: 8, fontWeight: 'bold', fontSize: 20, textAlign: 'center', color: '#fff' }}>Ajustes</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#EFEFF4', flex: 1 }}>
                            <SettingsList borderColor='#c8c7cc' defaultItemSize={50}>
                                <SettingsList.Header headerStyle={{ marginTop: 15 }} />
                                <SettingsList.Item
                                    icon={<Image style={styles.imageStyle} source={require('../assets/update.png')} />}
                                    title='Actualizar aplicación'
                                    titleInfo='Actualizar'
                                    titleInfoStyle={styles.titleInfoStyle}
                                    onPress={() => { this.showSettings(false); this.updateApp(); }}
                                />
                                <SettingsList.Item
                                    icon={<Image style={styles.imageStyle} source={require('../assets/login.png')} />}
                                    hasSwitch={true}
                                    switchState={this.state.autoLogin}
                                    switchOnValueChange={this.setAutoLogin}
                                    hasNavArrow={false}
                                    title='Inicio de sesión automático'
                                    onPress={() => { this.setAutoLogin(!this.state.autoLogin); }}
                                />
                                <SettingsList.Item
                                    icon={<Image style={styles.imageStyle} source={require('../assets/notifications.png')} />}
                                    title='Notificaciones'
                                    titleInfo='Abrir ajustes'
                                    titleInfoStyle={styles.titleInfoStyle}
                                    onPress={() => { this.showNotificationsSettings(); }}
                                />
                                <SettingsList.Header headerStyle={{ marginTop: 15 }} />
                                <SettingsList.Item
                                    icon={<Image style={styles.imageStyle} source={require('../assets/id.png')} />}
                                    title='Notificación push ID'
                                    onPress={() => {
                                        if (this.state.pushToken) {
                                            const token = 'Token: ' + this.state.pushToken + '\n';
                                            Alert.alert(
                                                'Notificación ID',
                                                token,
                                                [
                                                    {
                                                        text: 'Compartir', onPress: () => {
                                                            Share.share({
                                                                title: "Token",
                                                                message: token
                                                            });
                                                        }
                                                    },
                                                    { text: 'OK', onPress: () => { } }
                                                ],
                                                { cancelable: true }
                                            );
                                        }
                                    }}
                                />
                                <SettingsList.Item
                                    icon={<Image style={styles.imageStyle} source={require('../assets/information.png')} />}
                                    title='Información del sistema'
                                    onPress={async () => {
                                        let ip;
                                        try { ip = '\nIp: ' + await Network.getIpAddressAsync(); } catch (error) { };
                                        const informacionSistema = 'Expo: ' + Constants.expoVersion + '\nId: ' + Constants.installationId +
                                            '\nNombre: ' + Constants.deviceName + '\nAño: ' + Constants.deviceYearClass +
                                            '\nPlataforma: ' + (Platform.OS === 'ios' ? 'iOS' : 'Android') +
                                            '\nVersión: ' + parseInt(Platform.Version, 10) +
                                            (Platform.OS === 'ios' ? '\nModelo: ' + Constants.platform.ios.model : '') +
                                            (Platform.OS === 'ios' ? '\nPaís: ' + await Localization.region : '') +
                                            '\nRoot: ' + (await Device.isRootedExperimentalAsync() ? "Sí" : "No") +
                                            (ip ? ip : '') +
                                            '\nApiRoot Versión: ' + Constants.manifest.version;
                                        Alert.alert(
                                            'Información del sistema',
                                            informacionSistema,
                                            [
                                                {
                                                    text: 'Compartir', onPress: () => {
                                                        Share.share({
                                                            title: "Información del telefono",
                                                            message: informacionSistema
                                                        });
                                                    }
                                                },
                                                { text: 'OK', onPress: () => { } }
                                            ],
                                            { cancelable: true }
                                        );
                                    }}
                                />
                            </SettingsList>
                        </View>
                    </View>
                </Modal>
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo}
                        source={require('../assets/logo_apiroot.png')}
                        resizeMode="contain"
                    />
                </View>
                <View>
                    {/*<Text style={styles.title}>Autenticación</Text>*/}
                    <LoginForm
                        navigation={this.props.navigation}
                        setAutoLogin={(value) => { this.setState({ autoLogin: value }) }}
                    />
                </View>
            </KeyboardAvoidingView>
        )
    }

    static navigationOptions = ({ navigation }) => {
        const auxHeaderRight = <View style={{ flex: 1, flexDirection: 'row' }}>
            <TouchableOpacity style={{ paddingRight: 18 }}>
                <MaterialIcons name={"settings"} size={30} color="#fff" />
            </TouchableOpacity>
        </View>;
        return {
            headerTitle: 'ApiRoot',
            headerBackTitle: 'Login',
            headerTruncatedBackTitle: 'Login',
            headerRight: navigation.getParam("headerRight", auxHeaderRight),
            headerStyle: {
                backgroundColor: '#FF6161',
                borderWidth: 0,
                borderBottomWidth: 1,
                borderBottomColor: 'white',
            }
        };
    }
}

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            password: '',
            enabled: true,
            spinner: false,
        };
    }

    componentDidMount() {
        this.getCredentials();
    }

    setSpinnerVisible = (visible) => {
        this.setState({
            spinner: visible
        });
    }

    setCredentials = async (user, password) => {
        try {
            await SecureStore.setItemAsync('user', user);
        } catch (error) { }
        try {
            await SecureStore.setItemAsync('pass', password);
        } catch (error) { }
    }

    getCredentials = () => {
        this.setState({ enabled: false }, async () => {
            this.setSpinnerVisible(true);
            let user = '';
            let pass = '';
            let autoLogin = 'false';
            try {
                const value = await SecureStore.getItemAsync('user');
                if (value !== null) {
                    user = value;
                }
            } catch (error) { }
            try {
                const value = await SecureStore.getItemAsync('pass');
                if (value !== null) {
                    pass = value;
                }
            } catch (error) { }
            try {
                const value = await SecureStore.getItemAsync('autoLogin');
                if (value !== null) {
                    autoLogin = value;
                }
            } catch (error) { }

            this.props.setAutoLogin(autoLogin == 'true');
            this.setState({
                user: user,
                password: pass,
                enabled: true,
            }, () => {
                this.setSpinnerVisible(false);
                if (user != '' && pass != '' && autoLogin == 'true') {
                    this.comprobarLogin();
                }
            });
        });
    }

    comprobarLogin = () => {
        const { navigate } = this.props.navigation;
        const user = this.state.user;
        const password = this.state.password;
        const myThis = this;
        if (user && user != "" && password && password != "") {
            myThis.setCredentials(user, password);
            myThis.setSpinnerVisible(true);
            getLogin(user, password, function (respuesta) {
                if (respuesta.id && respuesta.token) {
                    myThis.setState({
                        //user: "",
                        //password: ""
                    }, async () => {
                        try {
                            await SecureStore.setItemAsync('token', respuesta.token);
                        } catch (error) { }
                        try {
                            await SecureStore.setItemAsync('id', "" + respuesta.id);
                        } catch (error) { }

                        getGrupos(function (respuesta) {
                            myThis.setSpinnerVisible(false);
                            if (respuesta && Array.isArray(respuesta)) {
                                navigate('ListaGrupos', {
                                    datos: respuesta
                                });
                            } else if (respuesta && respuesta.error) {
                                setTimeout(() => {
                                    Alert.alert(
                                        'Error',
                                        respuesta.error,
                                        [
                                            { text: 'Reintentar', onPress: () => { myThis.comprobarLogin(); } },
                                            { text: 'OK', onPress: () => { } }
                                        ],
                                        { cancelable: false }
                                    );
                                }, alertTimeout);
                            } else {
                                setTimeout(() => {
                                    Alert.alert(
                                        'Error',
                                        'Error en la comunicación con el servidor (-104)',
                                        [
                                            { text: 'Reintentar', onPress: () => { myThis.comprobarLogin(); } },
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
                                    'Error en la comunicación con el servidor (-103)',
                                    [
                                        { text: 'Reintentar', onPress: () => { myThis.comprobarLogin(); } },
                                        { text: 'OK', onPress: () => { } }
                                    ],
                                    { cancelable: false }
                                );
                            }, alertTimeout);
                        });
                    });
                } else if (respuesta.error) {
                    myThis.setSpinnerVisible(false);
                    setTimeout(() => {
                        Alert.alert(
                            'Error',
                            respuesta.error,
                            [
                                { text: 'OK', onPress: () => { } }
                            ],
                            { cancelable: false }
                        );
                    }, alertTimeout);
                } else {
                    myThis.setSpinnerVisible(false);
                    setTimeout(() => {
                        Alert.alert(
                            'Error',
                            'Error en la comunicación con el servidor (-101)',
                            [
                                { text: 'Reintentar', onPress: () => { myThis.comprobarLogin(); } },
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
                        'Error en la comunicación con el servidor (-102)',
                        [
                            { text: 'Reintentar', onPress: () => { myThis.comprobarLogin(); } },
                            { text: 'OK', onPress: () => { } }
                        ],
                        { cancelable: false }
                    );
                }, alertTimeout);
            });
        } else {
            setTimeout(() => {
                Alert.alert(
                    'Error',
                    'Introduzca un usuario y contraseña válidos',
                    [
                        { text: 'OK', onPress: () => { } }
                    ],
                    { cancelable: false }
                );
            }, alertTimeout);
        }
    }

    handleUser = (user) => {
        this.setState({ user: user });
    }

    handlePassword = (password) => {
        this.setState({ password: password });
    }

    render() {
        return (
            <View style={styles.containerForm}>
                <Spinner visible={this.state.spinner} textContent={"Cargando..."} textStyle={{ color: '#FFF' }} />
                <View style={styles.inputRow}>
                    <Feather name={"user"} size={25} color="#d24040" style={{ alignSelf: 'center', marginLeft: 5 }} />
                    <TextInput
                        placeholder="Introduzca su usuario"
                        placeholderTextColor="#d24040"
                        returnKeyType="next"
                        onSubmitEditing={() => { this.passwordInput.focus(); }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={this.handleUser}
                        style={styles.input}
                        underlineColorAndroid={'transparent'}
                        editable={this.state.enabled}
                    >{this.state.user}</TextInput>
                </View>
                <View style={styles.inputRow}>
                    <Feather name={"lock"} size={25} color="#d24040" style={{ alignSelf: 'center', marginLeft: 5 }} />
                    <TextInput
                        placeholder="Introduzca su contraseña"
                        placeholderTextColor="#d24040"
                        secureTextEntry
                        returnKeyType="go"
                        onSubmitEditing={() => { this.comprobarLogin(); }}
                        onChangeText={this.handlePassword}
                        style={styles.input}
                        ref={(input) => this.passwordInput = input}
                        underlineColorAndroid={'transparent'}
                        editable={this.state.enabled}
                    >{this.state.password}</TextInput>
                </View>
                <TouchableOpacity
                    disabled={!this.state.enabled}
                    style={styles.buttonContainer}
                    onPress={() => { this.comprobarLogin(); }}>
                    <Text style={styles.buttonText}>
                        Iniciar Sesión
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    logoContainer: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
        maxHeight: '40%'
    },
    title: {
        color: '#d24040',
        marginTop: 10,
        opacity: 0.9,
        textAlign: 'center'
    },
    containerForm: {
        padding: 20,
    },
    inputRow: {
        flexDirection: 'row',
        height: 45,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: '#d24040',
        marginBottom: 20
    },
    input: {
        flex: 1,
        height: 45,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#d24040',
    },
    buttonContainer: {
        backgroundColor: '#ff6161',
        paddingVertical: 18,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ff6161',
        marginTop: 20
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '700',
        fontSize: 20
    },
    logo: {
        maxWidth: '80%',
        flex: 1
    },
    imageStyle: {
        marginLeft: 15,
        alignSelf: 'center',
        height: 30,
        width: 30
    },
    titleInfoStyle: {
        fontSize: 16,
        color: '#8e8e93'
    }
});
