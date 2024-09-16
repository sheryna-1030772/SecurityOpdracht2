import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

function NavBar(props) {
    const navigation = useNavigation();

    const handleLinkPress = (screen) => {
        navigation.navigate(screen);
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        props.setIsLoggedIn(false);
        navigation.navigate('Homepage');
        alert('Uitgelogd');
    };

    return (
        <View style={styles.navbar}>
            <Text style={styles.navLogo}>GLITCH | HR</Text>
            <View style={styles.navLinks}>
                {props.links.map((link, index) => (
                    <Pressable key={index} onPress={() => handleLinkPress(link.screen)}>
                        {({ pressed }) => (
                            <Text style={[styles.navLink, { opacity: pressed ? 0.5 : 1 }]}>
                                {link.text}
                            </Text>
                        )}
                    </Pressable>
                ))}
            </View>
            {props.isLoggedIn && (
                <Pressable onPress={handleLogout}>
                    {({ pressed }) => (
                        <Text style={[styles.navLink, { opacity: pressed ? 0.5 : 1 }]}>
                            Uitloggen
                        </Text>
                    )}
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    navbar: {
        backgroundColor: "rgb(187, 21, 21)",
        paddingTop: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    navLogo: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    navLinks: {
        flexDirection: "row",
        alignItems: "center",
    },
    navLink: {
        color: "white",
        paddingVertical: 15,
        paddingHorizontal: 10,
        fontSize: 20,
    },
});

export default NavBar;