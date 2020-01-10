import { fetch } from "fetch-awesome";
import { Alert, Platform } from "react-native";
import { Updates } from "expo";
import * as SecureStore from 'expo-secure-store';
const utf8 = require('utf8');
const base64 = require('base-64');
const sha512 = require('js-sha512');


const timeout = 5000;

getHost = function (callback) {
    return callback("https://tfg.larryrider.es");
}

getToken = async function (callback, callbackError) {
    try {
        const value = await SecureStore.getItemAsync('token');
        if (value !== null) {
            return callback(value);
        } else {
            return callbackError("no token guardado")
        }
    } catch (error) {
        return callbackError("error getToken" + error);
    }
}

getUserId = async function (callback, callbackError) {
    try {
        const value = await SecureStore.getItemAsync('id');
        if (value !== null) {
            return callback(value);
        } else {
            return callbackError("no userId guardado")
        }
    } catch (error) {
        callbackError("error getUserId " + error);
    }
}

exports.checkUpdates = async () => {
    try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            setTimeout(() => {
                Alert.alert(
                    'Actualización disponible\n\n',
                    'Pulse OK para actualizar la aplicación.\n',
                    [
                        { text: 'OK', onPress: () => { Updates.reloadFromCache(); } }
                    ],
                    { cancelable: false }
                )
            }, 550);
        }
    } catch (error) { }
}

exports.getLogin = function (user, pass, callback, callbackError) {
    getHost(function (host) {
        const url = host + "/login";
        const body = `{
            "username": "`+ base64.encode(utf8.encode(user)) + `",
            "password": "`+ sha512(pass) + `"
        }`;
        console.log("BODY: " + body);
        fetch(url, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: timeout,
            retries: 0
        }).then((response) => {
            return response.json();
        }).then((responseJson) => {
            console.warn("Respuesta getLogin: " + JSON.stringify(responseJson));
            callback(responseJson);
        }).catch((error) => {
            console.warn("Error getLogin: " + error);
            callbackError({ "error": error });
        });
    });
}

exports.getGrupos = function (callback, callbackError) {
    getHost(function (host) {
        getUserId(function (idUser) {
            const url = host + "/users/" + idUser + "/groups";
            getToken(function (token) {
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token
                    },
                    timeout: timeout,
                    retries: 0
                }).then((response) => {
                    return response.json();
                }).then((responseJson) => {
                    console.warn("Respuesta getGrupos: " + JSON.stringify(responseJson));
                    callback(responseJson);
                }).catch((error) => {
                    console.warn("Error getGrupos: " + error);
                    callbackError({ "error": error });
                });
            }, function (error) {
                console.warn("Error getGrupos-TOKEN: " + error);
                callbackError({ "error": error });
            });
        }, function (error) {
            console.warn("Error getGrupos-USERID: " + error);
            callbackError({ "error": error });
        });
    });
}

exports.getApis = function (idGrupo, callback, callbackError) {
    getHost(function (host) {
        getUserId(function (idUser) {
            const url = host + "/users/" + idUser + "/groups/" + idGrupo + "/apis";
            getToken(function (token) {
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token
                    },
                    timeout: timeout,
                    retries: 0
                }).then((response) => {
                    return response.json();
                }).then((responseJson) => {
                    console.warn("Respuesta getApis: " + JSON.stringify(responseJson));
                    callback(responseJson);
                }).catch((error) => {
                    console.warn("Error getApis: " + error);
                    callbackError({ "error": error });
                });
            }, function (error) {
                console.warn("Error getApis-TOKEN: " + error);
                callbackError({ "error": error });
            });
        }, function (error) {
            console.warn("Error getApis-USERID: " + error);
            callbackError({ "error": error });
        });
    });
}

exports.alertTimeout = (Platform.OS.toLocaleLowerCase() === 'android' ? 0 : 550);
