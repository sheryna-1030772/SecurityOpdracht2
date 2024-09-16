import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView, Platform } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import AsyncStorage from '@react-native-async-storage/async-storage'

function Course({ courses }) {
    const navigation = useNavigation()

    const handleCoursePress = (course_id) => {
        navigation.navigate("Instances", { course_id })
    }

    return (
        <View style={styles.section}>
            {Array.isArray(courses) ? courses.map((course, index) => (
                <Pressable key={index} onPress={() => handleCoursePress(course.id)} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}>
                    <Text style={styles.buttonText}>
                        {course.course_name}
                    </Text>
                    <Text>
                        {course.description}
                    </Text>
                </Pressable>
            )) : <Text>Geen cursussen beschikbaar</Text>}
        </View>
    )
}

function CoursesApp() {
    const navigation = useNavigation()
    const route = useRoute()
    const { domainId } = route.params

    const [courses, setCourses] = useState([])

    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken')
                if (!token) {
                    console.error('Geen token gevonden, log alsjeblieft in.')
                    return
                }

                const response = await fetch(`${backendUrl}/api/domain=${domainId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error('Ongeautoriseerd: Ongeldige token of niet ingelogd.')
                    } else if (response.status === 422) {
                        console.error('Onverwerkbare Entiteit: Ongeldige verzoekgegevens.')
                    } else {
                        console.error('Cursussen ophalen mislukt:', response.statusText)
                    }
                    return
                }

                const data = await response.json()
                setCourses(data)
            } catch (error) {
                console.error('Fout bij het ophalen van cursussen:', error)
            }
        }

        fetchCourses()
    }, [domainId])

    return (
        <View style={Platform.OS === "android" ? styles.container : styles.containerWeb}>
            <NavBar links={[
                { screen: 'Homepage', text: 'Home' },
                { screen: 'Dashboard', text: 'Dashboard' },
                { screen: 'Domains', text: 'Domeinen' }]}/>
            <Text style={styles.pageTitle}>Cursussen</Text>
            <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <View style={Platform.OS === "android" ? styles.contentPage : styles.contentPageWeb}>
                    <Course courses={courses}/>
                </View>
            </ScrollView>
            <Footer/>
        </View>
    )
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
})

export default CoursesApp
