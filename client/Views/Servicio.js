import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    BackHandler,
    Picker,
    Modal,
    Alert,
    ScrollView,
    Platform
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { executeService, putService, alertTimeout, sendWebhook } from "../Utility/Api";

const utf8 = require('utf8');
const base64 = require('base-64');

export default class Servicio extends Component {
    _didFocusSubscription;
    _willBlurSubscription;

    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const servicioJSON = navigation.getParam('servicio', {});
        const bytes = base64.decode(servicioJSON.service_xml)
        //console.log(utf8.decode(bytes));
        const servicio = JSON.parse(utf8.decode(bytes));

        let htmlContent = ``;
        if (servicioJSON.service_document && servicioJSON.service_document != "" &&
            servicioJSON.service_document.toLowerCase() != "none") {
            const bytesDocument = base64.decode(servicioJSON.service_document);
            htmlContent = utf8.decode(bytesDocument);
            if (Platform.OS.toLocaleLowerCase() === 'ios') {
                htmlContent = htmlContent.replace(/body/g, 'body style="margin-top: 40px; margin-left: 20px; background-color: #fff;/*#ffefe2;*/"');
            } else {
                htmlContent = htmlContent.replace(/body/g, 'body style="margin-top: 20px; margin-left: 20px; background-color: #fff;/*#ffefe2;*/"');
            }
            //console.warn(htmlContent);
        }

        if (servicio && servicio.method) {
            this.state = {
                json: servicioJSON,
                servicio: servicio,
                params: servicio.out_params,
                spinner: false,
                modalVisible: false,
                htmlContent: htmlContent,
                user: ''
            };
        } else {
            this.state = {
                json: servicioJSON,
                servicio: servicio,
                params: [{
                    "id": 'error',
                    "values": [{ "value": "error" }],
                }],
                spinner: false,
                modalVisible: false,
                htmlContent: 'error',
                user: 'error'
            };
        }
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload => {
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        });
    }

    componentWillUnmount() {
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
    }

    componentDidMount() {
        this.props.navigation.setParams({
            headerLeft: () => (
                <TouchableOpacity
                    style={{ paddingHorizontal: 15 }}
                    onPress={() => { this.goBack(); }} >
                    <MaterialCommunityIcons name={"arrow-left"} size={30} color="#fff" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity
                    style={{ paddingHorizontal: 15 }}
                    onPress={() => { this.showHelp(); }} >
                    <MaterialCommunityIcons name={"help-circle-outline"} size={30} color="#fff" />
                </TouchableOpacity>
            )
        });

        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
        this.getUser();
        this.selectPickers();
        console.warn(this.state.json)
        console.warn(this.state.servicio)
    }

    setSpinnerVisible = (visible) => {
        this.setState({
            spinner: visible
        });
    }

    setModalVisible = (visible) => {
        this.setState({
            modalVisible: visible
        });
    }

    showHelp = () => {
        let mensaje = '';
        if (this.state.json.is_repeatable.toLowerCase() != "yes") {
            mensaje = '\nConfirmar -> Envía al servidor las opciones seleccionadas.\n\n' +
                'Descartar -> Ignora esta petición y la descarta para no mostrarla en la lista de servicios pendientes.\n\n' +
                'Cancelar -> Vuelve a la pantalla anterior.';
        } else {
            mensaje = '\nConfirmar -> Envía al servidor las opciones seleccionadas.\n\n' +
                'Cancelar -> Vuelve a la pantalla anterior.';
        }
        Alert.alert(
            'Ayuda',
            mensaje,
            [
                { text: 'OK', onPress: () => { } }
            ],
            { cancelable: true }
        );
    }

    onBackButtonPressAndroid = () => {
        this.props.navigation.state.params.refresh();
    }

    goBack = () => {
        this.onBackButtonPressAndroid();
        this.props.navigation.goBack();
    }

    getUser = async () => {
        let user = "0";
        try {
            const value = await SecureStore.getItemAsync('user_id');
            if (value !== null) {
                user = value;
            }
        } catch (error) { }
        this.setState({
            user: user
        });
    }

    selectPickers = () => {
        if (this.state.params && this.state.params.length > 0) {
            for (let i = 0; i < this.state.params.length; i++) {
                if (this.state.params[i].param.values.length > 0) {
                    let selected = {};
                    selected['selected'.concat("" + i)] = this.state.params[i].param.values[0].value;
                    console.warn(selected);
                    this.setState(selected);
                }
            }
        }
    }

    confirmarServicio() {
        if (this.state.json.service_id && this.state.servicio.uri_template) {
            const myThis = this;
            let url = this.state.servicio.uri_template;
            if (this.state.params && this.state.params.length > 0) {
                for (let i = 0; i < this.state.params.length; i++) {
                    const replace = this.state['selected'.concat("" + i)];
                    url = url.replace(new RegExp("{" + this.state.params[i].param.id + "}", "gi"), replace);
                }
            }
            this.setSpinnerVisible(true);
            const method = this.state.servicio.method;
            //sendWebhook(":white_check_mark: Confirmando el servicio: " + this.state.json.service_name);
            executeService(method, url, function (respuesta, estado) {
                putService(myThis.state.user, myThis.state.json.service_id, url, respuesta, estado, "Finished",
                    function (respuesta) {
                        myThis.setSpinnerVisible(false);
                        myThis.goBack();
                    }, function (error) {
                        myThis.setSpinnerVisible(false);
                        setTimeout(() => {
                            Alert.alert(
                                'Error',
                                'Error en la comunicación con el servidor (-401)',
                                [
                                    { text: 'Reintentar', onPress: () => { myThis.confirmarServicio(); } },
                                    { text: 'OK', onPress: () => { } }
                                ],
                                { cancelable: false }
                            )
                        }, alertTimeout);
                    }
                );
            }, function (error) {
                myThis.setSpinnerVisible(false);
                setTimeout(() => {
                    Alert.alert(
                        'Error',
                        'Error en la comunicación con el servidor (-402)',
                        [
                            { text: 'Reintentar', onPress: () => { myThis.confirmarServicio(); } },
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
                    'Por favor seleccione una opción para ejecutar el servicio',
                    [
                        { text: 'OK', onPress: () => { } }
                    ],
                    { cancelable: false }
                );
            }, alertTimeout);
        }
    }

    abortarServicio() {
        if (this.state.json.service_id && this.state.servicio.uri_template) {
            const myThis = this;
            this.setSpinnerVisible(true);
            sendWebhook(":negative_squared_cross_mark: Abortando el servicio: " + this.state.json.service_name);
            putService(this.state.user, this.state.json.service_id, this.state.servicio.uri_template,
                "Aborted", "", "Aborted", function (respuesta) {
                    myThis.setSpinnerVisible(false);
                    myThis.goBack();
                }, function (error) {
                    myThis.setSpinnerVisible(false);
                    setTimeout(() => {
                        Alert.alert(
                            'Error',
                            'Error en la comunicación con el servidor (-403)',
                            [
                                { text: 'Reintentar', onPress: () => { myThis.abortarServicio(); } },
                                { text: 'OK', onPress: () => { } }
                            ],
                            { cancelable: false }
                        );
                    }, alertTimeout);
                }
            );
        }
    }

    cancelarServicio = () => {
        this.goBack();
    }

    render() {
        let pickers = [];
        if (this.state.params && this.state.params.length > 0) {
            for (let i = 0; i < this.state.params.length; i++) {
                if (this.state.params[i].param.visible) {
                    const items = this.state.params[i].param.values.map((s, i) => {
                        return <Picker.Item key={i} value={s.value} label={s.value} />;
                    });
                    pickers.push(<View key={i}>
                        <Text style={styles.descripcion}>{this.state.params[i].param.short_description}</Text>
                        <Picker
                            key={i}
                            selectedValue={this.state['selected'.concat("" + i)]}
                            onValueChange={(itemValue, itemIndex) => {
                                let selected = {}
                                selected['selected'.concat("" + i)] = itemValue
                                this.setState(selected)
                            }}>
                            {items}
                        </Picker>
                    </View>);
                }
            }
        }

        let buttons = [];
        if (this.state.htmlContent != "" && this.state.htmlContent != 'error') {
            buttons.push(<TouchableOpacity
                key={"" + 0}
                style={[styles.buttonContainer, { borderWidth: 1, borderRadius: 10, borderColor: '#ff6b6b', backgroundColor: '#ff8c8c' }]}
                onPress={() => { this.setModalVisible(true); }}>
                <Text style={styles.buttonText}>
                    Ver Documentación
                </Text>
            </TouchableOpacity>);
        }

        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <Spinner visible={this.state.spinner} textContent={"Cargando..."} textStyle={{ color: '#FFF' }} />

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setModalVisible(false);
                    }}>
                    <View style={{ flex: 1 }}>
                        <WebView
                            source={{ html: this.state.htmlContent, baseUrl: '' }}
                            originWhitelist={['*']}
                        />
                        <TouchableOpacity
                            style={{
                                borderWidth: 1,
                                borderColor: '#ff6b6b',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 80,
                                height: 80,
                                backgroundColor: '#fff',
                                borderRadius: 100,
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                margin: 15
                            }}
                            onPress={() => { this.setModalVisible(false); }}>
                            <MaterialCommunityIcons name={"check"} size={40} color="#01a699" />
                        </TouchableOpacity>
                    </View>
                </Modal>

                <ScrollView>
                    <View style={styles.container}>
                        <Text style={styles.descripcion}>{this.state.json.service_name}</Text>
                    </View>
                    <View style={styles.container}>
                        {pickers}
                        {buttons}
                    </View>
                    <View style={styles.bottomView}>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => { this.confirmarServicio(); }}>
                            <Text style={styles.buttonText}>
                                CONFIRMAR
                            </Text>
                        </TouchableOpacity>
                        {this.state.json.is_repeatable.toLowerCase() != "yes" && <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => { this.abortarServicio(); }}>
                            <Text style={styles.buttonText}>
                                DESCARTAR
                            </Text>
                        </TouchableOpacity>}
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => { this.cancelarServicio(); }}>
                            <Text style={styles.buttonText}>
                                CANCELAR
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    }

    static navigationOptions = ({ navigation }) => {
        const auxHeaderLeft = () => <TouchableOpacity style={{ paddingHorizontal: 15 }}>
            <MaterialCommunityIcons name={"arrow-left"} size={30} color="#fff" />
        </TouchableOpacity>;
        const auxHeaderRight = () => <TouchableOpacity style={{ paddingHorizontal: 15 }}>
            <MaterialCommunityIcons name={"help-circle-outline"} size={30} color="#fff" />
        </TouchableOpacity>;
        return {
            title: 'Ejecutar Servicio',
            headerLeft: navigation.getParam("headerLeft", auxHeaderLeft),
            headerRight: navigation.getParam("headerRight", auxHeaderRight)
        };
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15
    },
    descripcion: {
        fontSize: 20
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
        backgroundColor: '#ff6b6b',
        paddingVertical: 20
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    },
    bottomView: {
        width: '100%',
        marginBottom: 30
    }
});