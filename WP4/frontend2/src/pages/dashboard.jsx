import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';
 

function Course({ courses }) {
    const navigation = useNavigation();

    const handleCoursePress = (course_id) => {
        navigation.navigate("Instances", { course_id });
    };

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
    );
}

function Dashboard() {
    const [courses, setCourses] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [domainName, setDomainName] = useState(null);
    
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    console.error('No token found, please log in.');
                    return;
                }

                const domainResponse = await fetch(`${backendUrl}/api/chosen_domain`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!domainResponse.ok) {
                    if (domainResponse.status === 401) {
                        console.error('Unauthorized: Invalid token or not logged in.');
                    } else {
                        console.error('Failed to fetch chosen domain:', domainResponse.statusText);
                    }
                    return;
                }

                const domainData = await domainResponse.json();
                console.log("Fetched Chosen Domain from API: ", domainData);
                setDomainName(domainData.domain_name);

                const coursesResponse = await fetch(`${backendUrl}/api/user_courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!coursesResponse.ok) {
                    if (coursesResponse.status === 401) {
                        console.error('Unauthorized: Invalid token or not logged in.');
                    } else if (coursesResponse.status === 422) {
                        console.error('Unprocessable Entity: Invalid request data.');
                    } else {
                        console.error('Failed to fetch courses:', coursesResponse.statusText);
                    }
                    return;
                }

                const coursesData = await coursesResponse.json();
                console.log("Fetched Courses from API: ", coursesData);
                setCourses(coursesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const links = [
        { screen: 'Homepage', text: 'Home' }
    ];

    return (
        <View style={Platform.OS === "android" ? styles.container : styles.containerWeb}>
            <NavBar links={links} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Text style={styles.pageTitle}>{domainName ? `${domainName}` : 'Dashboard'}</Text>
            <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <View style={Platform.OS === "android" ? styles.contentPage : styles.contentPageWeb}>
                    <Course courses={courses} />
                </View>
            </ScrollView>
            <Footer />
        </View>
    );
}

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
    section: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        color: 'black',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: 50,
        paddingBottom: 50,
    },
    button: {
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
    },
});

export default Dashboard;
