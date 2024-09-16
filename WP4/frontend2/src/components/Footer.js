import React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"

function Footer() {
    return (
        <View style={styles.footer}>
                <Text style={styles.text}>&copy; 2024 Hogeschool Rotterdam</Text>
        </View>
    );
}

const window = Dimensions.get("window")

const styles = StyleSheet.create({
    footer: {
        backgroundColor: "rgb(187, 21, 21)",
        color: "white",
        position: "relative", 
        alignItems: "center",
        width: window.width,
        height: window.height * 0.07,
        bottom: 0,
    },
    text: {
        marginBottom: "auto",
        marginTop: "auto",
    }
})

export default Footer;