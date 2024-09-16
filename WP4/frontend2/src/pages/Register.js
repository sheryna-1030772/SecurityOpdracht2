import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { universalAlert } from '../utilities';
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const RegisterApp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [infix, setInfix] = useState('');
    const [lastName, setLastName] = useState('');
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(!!AsyncStorage.getItem('token'));

    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
                const response = await fetch(`${backendUrl}/api/register/domains`);
                const data = await response.json();
                if (response.ok) {
                    setDomains(data);
                }
            } catch (error) {
                console.error('Fout bij het ophalen van domeinen:', error);
            }
        };
        fetchDomains();
    }, []);

    const handleRegister = async () => {
        if (!email || !password || !firstName || !lastName || !selectedDomain) {
            universalAlert('Registratiefout', 'Alle velden behalve tussenvoegsel zijn verplicht');
            return;
        }

        if (!email.endsWith('@hr.nl')) {
            universalAlert('Registratiefout', 'Email moet een HR.nl adres zijn');
            return;
        }

        if (password !== confirmPassword) {
            universalAlert('Registratiefout', 'Wachtwoorden komen niet overeen');
            return;
        }

        try {
            let backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    firstname: firstName,
                    infix,
                    lastname: lastName,
                    domain: selectedDomain
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                universalAlert('Registratie Succesvol', responseData.success || 'U bent nu geregistreerd.');
                navigation.navigate('Login');
            } else {
                universalAlert('Registratie Mislukt', responseData.error || 'Er is iets misgegaan tijdens de registratie.');
            }
        } catch (error) {
            console.error(error);
            universalAlert('Netwerkfout', 'Kan geen verbinding maken met de server.');
        }
    };

    return (
        <View style={Platform.OS === "android" ? styles.container : styles.containerWeb}>
            <NavBar links={[{ screen: 'Homepage', text: 'Home' }, { screen: 'Login', text: 'Login' }]} />
            <Text style={styles.pageTitle}>Registreren</Text>
            <View style={Platform.OS === "android" ? styles.contentPage : styles.contentPageWeb}>
                <TextInput
                    style={styles.input}
                    placeholder="Email (@hr.nl)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Wachtwoord"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Bevestig Wachtwoord"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Voornaam"
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Tussenvoegsel (optioneel)"
                    value={infix}
                    onChangeText={setInfix}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Achternaam"
                    value={lastName}
                    onChangeText={setLastName}
                />
                <Picker
                    selectedValue={selectedDomain}
                    style={styles.input}
                    onValueChange={(itemValue, itemIndex) => setSelectedDomain(itemValue)}>
                    <Picker.Item label="Selecteer een domein" value="" />
                    {domains.map((domain) => (
                        <Picker.Item key={domain.id} label={domain.domain_name} value={domain.id} />
                    ))}
                </Picker>
                <Button title="Registreren" onPress={handleRegister} color="#BB1515" />
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
        height: windowHeight,
        padding: 10,
    },
    contentPageWeb: {
        flex: 1,
        width: 350,
        padding: 10,
        alignSelf: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 8,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    pageTitle: {
        fontSize: 24,
        textAlign: "center",
        marginVertical: 10,
    },
});

export default RegisterApp;