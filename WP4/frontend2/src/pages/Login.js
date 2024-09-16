import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { universalAlert } from '../utilities';
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const LoginApp = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            let backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const responseData = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem('userToken', responseData.access_token);
                if (!isNaN(username)) {
                navigation.navigate('Dashboard');
                } else {
                    navigation.navigate('ProgressOverview');
                }
            } else {
                universalAlert('Login Mislukt', responseData.message);
            }
        } catch (error) {
            console.error(error);
            universalAlert('Login Fout', 'Er ging iets mis. Probeer het later nog een keer.');
        }
    };

    return (
        <View style={Platform.OS === "android" ? styles.container : styles.containerWeb}>
            <NavBar links={[{ screen: 'Homepage', text: 'Home' }]}/>
            <Text style={styles.pageTitle}>Inloggen</Text>
            <View style={Platform.OS === "android" ? styles.contentPage : styles.contentPageWeb}>
                <TextInput
                    style={styles.input}
                    placeholder="Studentnummer of personeelscode"
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Wachtwoord"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <Button title="Inloggen" onPress={handleLogin} color="#BB1515" />
            </View>
            <Footer />
        </View>
    );
};

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 0,
        height: windowHeight,
        backgroundColor: "rgb(247, 243, 231)",
    },
    containerWeb: {
        margin: 0,
        height: windowHeight,
        backgroundColor: "rgb(247, 243, 231)",
    },
    contentPage: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: windowWidth,
        gap: 25,
        paddingLeft: 25,
        paddingRight: 25,
    },
    contentPageWeb: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: 750,
        gap: 25,
        paddingLeft: 25,
        paddingRight: 25,
    },
    input: {
        width: '80%',
        marginVertical: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'white',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        paddingTop: 50,
        paddingBottom: 50,
    },
    text: {
        fontSize: 16,
        textAlign: "center",
    },
});

export default LoginApp;
