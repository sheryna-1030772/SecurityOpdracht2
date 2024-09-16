import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfile = ({ navigation }) => {
    const [userData, setUserData] = useState({
        firstName: '',
        infix: '',
        lastName: '',
        email: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    console.error('No token found, please log in.');
                    navigation.navigate('Login');
                    return;
                }

                let backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
                const response = await fetch(`${backendUrl}/api/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Failed to fetch user data:', response.statusText);
                    return;
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            let backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/updateUser`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                console.error('Failed to update profile:', response.statusText);
                return;
            }

            const data = await response.json();
            console.log('Profile updated successfully:', data);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <View style={Platform.OS === 'android' ? styles.container : styles.containerWeb}>
            {/* Temporarily comment out NavBar and Footer */}
            {/* <NavBar links={[
                { screen: 'Homepage', text: 'Home' },
                { screen: 'Dashboard', text: 'Dashboard' },
                { screen: 'Domains', text: 'Domeinen' }
            ]} /> */}
            <Text style={styles.pageTitle}>User Profile</Text>
            <View style={Platform.OS === 'android' ? styles.contentPage : styles.contentPageWeb}>
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={userData.firstName}
                    onChangeText={(text) => setUserData({ ...userData, firstName: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Infix (optional)"
                    value={userData.infix}
                    onChangeText={(text) => setUserData({ ...userData, infix: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={userData.lastName}
                    onChangeText={(text) => setUserData({ ...userData, lastName: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={userData.email}
                    onChangeText={(text) => setUserData({ ...userData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Button title="Update Profile" onPress={handleUpdateProfile} color="#BB1515" />
            </View>
            {/* <Footer /> */}
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
        backgroundColor: 'rgb(247, 243, 231)',
    },
    containerWeb: {
        margin: 0,
        height: windowHeight,
        backgroundColor: 'rgb(247, 243, 231)',
    },
    contentPage: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: windowWidth,
        gap: 25,
        paddingLeft: 25,
        paddingRight: 25,
    },
    contentPageWeb: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: 50,
        paddingBottom: 50,
    },
});

export default UserProfile;
