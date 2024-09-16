import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

function gradeProgress(activity, status) {
    let backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL
    fetch(`${backendUrl}/api/teacher/dashboard/progress/grade`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            activity: activity,
            status: status,
        })
    })
}

function Progress({ progresses }) {
    const filteredProgresses = progresses.filter(progress => progress.status == 'Ingeleverd')

    return (
        <ScrollView>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={styles.tableHeader}>Student</Text>
                    <Text style={styles.tableHeader}>Activiteit</Text>
                    <Text style={styles.tableHeader}>Status</Text>
                    <Text style={styles.tableHeader}>Inleverdatum</Text>
                    <Text style={styles.tableHeader}></Text>
                    <Text style={styles.tableHeader}></Text>
                </View>
                {filteredProgresses.map((progress, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{progress.student}</Text>
                        <Text style={styles.tableCell}>{progress.activity}</Text>
                        <Text style={styles.tableCell}>{progress.status}</Text>
                        <Text style={styles.tableCell}>{progress.date}</Text>
                        <TouchableOpacity style={styles.tableCell} onPress={() => gradeProgress(progress.activity, 'Voldaan')}>
                            <Text>Voldaan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tableCell} onPress={() => gradeProgress(progress.activity, 'Niet voldaan')}>
                            <Text>Niet voldaan</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

export default function ProgressOverview() {
    const [progress, setProgress] = useState([])

    const fetchProgress = () => {
        let backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL
        fetch(`${backendUrl}/api/teacher/dashboard/progress`)
            .then(res => res.json())
            .then(data => {
                setProgress(data)
            })
            .catch(error => {
                console.error('Error fetching progress:', error)
            })
    }

    useEffect(() => {
        fetchProgress() 
        const interval = setInterval(fetchProgress, 1000) 

        return () => {
            clearInterval(interval)
        }
    }, [])


    return (
        <View style={styles.container}>
            <NavBar links={[
                { screen: 'Homepage', text: 'Home' },
                { screen: 'GradedProgressOverview', text: 'Beoordeeld overzicht'},
                ]}/>
            <Text style={styles.pageTitle}>Voortgangsoverzicht</Text>
            <View style={styles.contentPage}>
                <Progress progresses={progress}/>
            </View>
            <Footer/>
        </View>
    )
}

const window = Dimensions.get("window")

const styles = StyleSheet.create({
    container: {
        margin: 0,
        backgroundColor: "rgb(247, 243, 231)"
    },
    contentPage: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        height: window.height * 0.73
    },
    table: {
        marginHorizontal: window.width * 0.05,
        marginTop: 20,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 5,
        overflow: "hidden"
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "black"
    },
    tableHeader: {
        flex: 1,
        fontWeight: "bold",
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: "rgb(187, 21, 21)",
        color: "white"
    },
    tableCell: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: "white"
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: window.height * 0.05,
        textAlign: "center"
    }
})
