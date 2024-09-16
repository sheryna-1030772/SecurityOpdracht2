import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, Dimensions, Pressable, ScrollView, Platform, TouchableOpacity} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import AsyncStorage from '@react-native-async-storage/async-storage';

function Instance({ instances, onInstancePress }) {
    return (
        <View style={styles.section}>
            {Array.isArray(instances) ? instances.map((instance, index) => (
                <Pressable key={index} onPress={() => onInstancePress(instance.id)} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                    <Text style={styles.buttonText}>{instance.period}</Text>
                    <Text>Jaar: {instance.year}</Text>
                </Pressable>
            )) : <Text>Geen instanties beschikbaar</Text>}
        </View>
    );
}

function InstancesApp() {
    const navigation = useNavigation();
    const route = useRoute();
    const { course_id } = route.params;

    const [instances, setInstances] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setIsLoggedIn(!!token);
        };

        checkLoginStatus();
    }, []);

    useEffect(() => {
        const fetchInstances = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await fetch(`${backendUrl}/api/course=${course_id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error('Ongeautoriseerd: Ongeldige token of niet ingelogd.');
                    } else if (response.status === 422) {
                        console.error('Onverwerkbare Entiteit: Ongeldige verzoekgegevens.');
                    } else {
                        console.error('Instanties ophalen mislukt:', response.statusText);
                    }
                    return;
                }

                const data = await response.json();
                setInstances(data);
            } catch (error) {
                console.error('Fout bij het ophalen van instanties:', error);
            }
        };

        fetchInstances();
    }, [course_id]);

    const handleInstancePress = (instance_id) => {
        navigation.navigate("Modules", { instance_id });
    };

    return (
        <View style={Platform.OS === "android" ? styles.container : styles.containerWeb}>
            <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} links={[
                { screen: 'Homepage', text: 'Home' },
                { screen: 'Dashboard', text: 'Dashboard' },
                
            ]} />
            <Text style={styles.pageTitle}>Instanties</Text>
            <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <View style={Platform.OS === "android" ? styles.contentPage : styles.contentPageWeb}>
                    <Instance instances={instances} onInstancePress={handleInstancePress} />
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Terug naar Cursussen</Text>
            </TouchableOpacity>
            </ScrollView>
            <Footer />
        </View>
    );
}

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

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
    section: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
        color: "black",
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        paddingTop: 50,
        paddingBottom: 50,
    },
    button: {
        backgroundColor: "white",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "black",
    },
            backButton: {
        backgroundColor: '#BB1515',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
        alignSelf: 'center'
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
})

export default InstancesApp
