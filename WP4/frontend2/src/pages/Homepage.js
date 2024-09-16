import React, { Component } from "react"
import { View, Text, ScrollView, StyleSheet, Dimensions, Platform } from "react-native"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import AsyncStorage from "@react-native-async-storage/async-storage";


class HomepageApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: !!AsyncStorage.getItem('token')
        };
        this.setIsLoggedIn = this.setIsLoggedIn.bind(this);
    }


    setIsLoggedIn(status) {
        this.setState({ isLoggedIn: status });
    }

    aboutUs() {
        return (
            <>
                <Text style={styles.heading}>Over Glitch</Text>
                <Text style={styles.text}>Het GLITCH-platform (Gamified Learning Interface Through Challenges and
                    Heuristics) is een innovatief, thema-onafhankelijk leerplatform ontworpen om
                    onderwijs op een dynamische en interactieve manier te benaderen. Het platform
                    gebruikt een modulaire structuur om een breed scala aan vakken en cursussen te
                    huisvesten, elk georganiseerd binnen specifieke domeinen om de navigatie en
                    specialisatie voor gebruikers te vergemakkelijken.
                </Text>
          </>
        )
    }

    contact() {
        return (
            <>
                <Text style={styles.heading}>Contact</Text>
                <Text style={styles.text}>Telefoon: 010 794 0000</Text>
                <Text style={styles.text}>Email: info@hogeschoolrotterdam.nl</Text>
                <Text style={styles.text}>Adres: Burgemeester S'jacobplein 1, 3015 CA Rotterdam</Text>
            </>
        )
    }

    render() {
        const { isLoggedIn } = this.state;
        const links = [
            !isLoggedIn && { screen: 'Login', text: 'Login' },
            !isLoggedIn && { screen: 'Register', text: 'Registreer' },
        ].filter(Boolean);

        return (
            <View style={Platform.OS === "android" ? styles.container : styles.containerWeb}>
                <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={this.setIsLoggedIn} links={links} />
                <Text style={styles.pageTitle}>Welkom bij GLITCH!</Text>
                <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <View style={Platform.OS === "android" ? styles.contentHomepage : styles.contentHomepageWeb}>
                        <View style={styles.section}>{this.aboutUs()}</View>
                        <View style={styles.section}>{this.contact()}</View>
                    </View>
                </ScrollView>
                <Footer />
            </View>
        );
    }
}

let windowHeight = Dimensions.get('window').height
let windowWidth = Dimensions.get('window').width

let styles = StyleSheet.create({
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
    contentHomepage: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        width: windowWidth,
        gap: 25,
        paddingLeft: 25,
        paddingRight: 25,
    },
    contentHomepageWeb: {
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
    text: {
        fontSize: 16
    }
})

export default HomepageApp

