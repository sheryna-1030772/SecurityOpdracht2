import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notification from "../components/Notification";

function ActivitiesPage() {
    const route = useRoute();
    const navigation = useNavigation();
    const { module_id } = route.params;

    const [activities, setActivities] = useState([]);
    const [moduleName, setModuleName] = useState('');
    const [coreAssignment, setCoreAssignment] = useState(null);
    const [conceptChallenge, setConceptChallenge] = useState(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isConceptChallengeCompleted, setIsConceptChallengeCompleted] = useState(false);
    const [isCoreAssignmentCompleted, setIsCoreAssignmentCompleted] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
    const [groupsCompleted, setGroupsCompleted] = useState({});
    const [nextModuleUnlocked, setNextModuleUnlocked] = useState(false);
    const [pointChallengeCompleted, setPointChallengeCompleted] = useState(false);

    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setIsLoggedIn(!!token);
        };

        checkLoginStatus();
    }, []);

    useEffect(() => {
        fetchModuleDetails();
    }, [module_id]);

    const fetchModuleDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${backendUrl}/api/activities?module_id=${module_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unauthorized');
            }

            const data = await response.json();
            setActivities(data.activities || []);
            setModuleName(data.module.module_name);
            setCoreAssignment(data.core_assignment[0]);
            setConceptChallenge(data.concept_challenge[0]);
            setTotalPoints(data.total_points || 0);
            setIsConceptChallengeCompleted(data.is_concept_challenge_completed);
            setIsCoreAssignmentCompleted(data.is_core_assignment_completed);
            setPointChallengeCompleted(data.point_challenge_completed);

            updateNotifications(data);
            updateNextModuleUnlocked(data);
            updateGroupsCompleted(data);

        } catch (error) {
            console.error('Error fetching module details:', error);
            alert('Failed to fetch module details. Please try again later.');
        }
    };

    const updateNotifications = (data) => {
        if (data.total_points >= 100 && !data.is_concept_challenge_completed) {
            showNotification('Mijlpaal Bereikt: Je hebt de Concept Uitdaging ontgrendeld!', 'success');
        }
        if (data.total_points >= 200 && !data.is_core_assignment_completed) {
            showNotification('Mijlpaal Bereikt: Je hebt de Kernopdracht ontgrendeld!', 'success');
        }
        if (data.point_challenge_completed && !pointChallengeCompleted) {
            showNotification('Puntuitdaging voltooid! Je hebt 50 extra punten verdiend!', 'success');
            setPointChallengeCompleted(true);
        }
    };

    const updateNextModuleUnlocked = (data) => {
        const groupsCount = data.activities.reduce((groups, activity) => {
            const group = activity.group_name;
            if (!groups[group]) {
                groups[group] = 0;
            }
            if (activity.status === 'submitted') {
                groups[group] += 1;
            }
            return groups;
        }, {});

        const groupNames = data.activities.map(activity => activity.group_name);
        const uniqueGroupNames = [...new Set(groupNames)];
        const allGroupsCompleted = uniqueGroupNames.every(group => groupsCount[group] > 0);
        const nextModuleUnlockedNow = data.total_points >= 50 && allGroupsCompleted;

        if (nextModuleUnlockedNow && !nextModuleUnlocked) {
            showNotification('Mijlpaal Bereikt: Het volgende module is ontgrendeld!', 'success');
            setNextModuleUnlocked(true);
        }
    };

    const updateGroupsCompleted = (data) => {
        const groupsCount = data.activities.reduce((groups, activity) => {
            const group = activity.group_name;
            if (!groups[group]) {
                groups[group] = 0;
            }
            if (activity.status === 'submitted') {
                groups[group] += 1;
            }
            return groups;
        }, {});
        setGroupsCompleted(groupsCount);
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ visible: true, message, type });
        setTimeout(() => {
            setNotification({ visible: false, message: '', type: '' });
        }, 10000);
    };

    const startActivity = async (activity_id) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${backendUrl}/api/startActivity`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activity_id, module_id })
            });

            if (!response.ok) {
                throw new Error('Failed to start activity');
            }

            setActivities(prevActivities => prevActivities.map(activity =>
                activity.id === activity_id ? { ...activity, status: 'started' } : activity
            ));
        } catch (error) {
            console.error('Error starting activity:', error);
        }
    };

    const completeActivity = async (activity_id, level) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${backendUrl}/api/completeActivity`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activity_id, module_id, level })
            });

            if (!response.ok) {
                throw new Error('Failed to complete activity');
            }

            const data = await response.json();
            setActivities(prevActivities => prevActivities.map(activity =>
                activity.id === activity_id ? { ...activity, status: 'submitted' } : activity
            ));
            setTotalPoints(data.total_points);
            setPointChallengeCompleted(data.point_challenge_completed);

            updateNotifications(data);
            updateNextModuleUnlocked(data);
            updateGroupsCompleted(data);

        } catch (error) {
            console.error('Error completing activity:', error);
        }
    };

    const completeConceptChallenge = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${backendUrl}/api/completeConceptChallenge`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ module_id })
            });

            if (!response.ok) {
                throw new Error('Failed to complete concept challenge');
            }

            const data = await response.json();
            setTotalPoints(data.total_points);
            setIsConceptChallengeCompleted(true);
            showNotification('Mijlpaal Bereikt: Je hebt de Concept Uitdaging voltooid en 100 punten verdiend!', 'success');
            fetchModuleDetails();

        } catch (error) {
            console.error('Error completing concept challenge:', error);
        }
    };

    const completeCoreAssignment = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${backendUrl}/api/completeCoreAssignment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ module_id })
            });

            if (!response.ok) {
                throw new Error('Failed to complete core assignment');
            }

            const data = await response.json();
            setTotalPoints(300); // Adjust totalPoints update if needed
            setIsCoreAssignmentCompleted(true);
            showNotification(data.notification_message, 'success');
            fetchModuleDetails();

        } catch (error) {
            console.error('Error completing core assignment:', error);
        }
    };

    const groupedActivities = Array.isArray(activities) ? activities.reduce((groups, activity) => {
        const group = activity.group_name;
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(activity);
        return groups;
    }, {}) : {};

    const isNextActivityStartable = (activities, currentIndex) => {
        if (currentIndex === 0) return true;
        return activities[currentIndex - 1].status === 'completed' || activities[currentIndex - 1].status === 'submitted';
    };

    const renderProgressBar = () => {
        const progress = (totalPoints / 200) * 100;
        let nextMilestone, pointsNeeded;

        if (totalPoints < 50) {
            pointsNeeded = 50 - totalPoints;
            nextMilestone = `Nog ${pointsNeeded} punten nodig om de puntuitdaging te voltooien en het volgende module te ontgrendelen`;
        } else if (totalPoints < 100) {
            pointsNeeded = 100 - totalPoints;
            nextMilestone = `Nog ${pointsNeeded} punten nodig om de Concept Uitdaging te ontgrendelen`;
        } else if (totalPoints < 200) {
            pointsNeeded = 200 - totalPoints;
            nextMilestone = `Nog ${pointsNeeded} punten nodig om de Kernopdracht te ontgrendelen`;
        } else {
            nextMilestone = 'Alle activiteiten voltooid!';
        }

        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{nextMilestone}</Text>
                {totalPoints >= 50 && !nextModuleUnlocked && (
                    <Text style={styles.progressText}>Je moet nog minimaal één activiteit in een andere groep voltooien om de module te ontgrendelen.</Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} links={[
                { screen: 'Homepage', text: 'Home' },
                { screen: 'Dashboard', text: 'Dashboard' },
                { screen: 'Domains', text: 'Domeinen' }
            ]} />
            <Text style={styles.pageTitle}>Activiteiten voor {moduleName}</Text>
            <Text style={styles.pointsText}>Totaalpunten: {totalPoints}</Text>
            {notification.visible && (
                <Notification message={notification.message} visible={notification.visible} type={notification.type} />
            )}
            {renderProgressBar()}
            <View style={styles.contentPage}>
                {coreAssignment && (
                    <View style={styles.challengeContainer}>
                        <Text style={styles.challengeTitle}>Kernopdracht</Text>
                        <Text style={styles.challengeName}>{coreAssignment.assignment_name}</Text>
                        <Text style={styles.challengeDescription}>{coreAssignment.description}</Text>
                        <Text style={styles.challengePoints}>
                            {totalPoints < 200 ? `Nog ${200 - totalPoints} punten nodig om de kernopdracht te ontgrendelen` : 'Je kunt de kernopdracht voltooien!'}
                        </Text>
                        {!isCoreAssignmentCompleted && totalPoints >= 200 && (
                            <TouchableOpacity style={styles.button} onPress={completeCoreAssignment}>
                                <Text style={styles.buttonText}>Kernopdracht Voltooien</Text>
                            </TouchableOpacity>
                        )}
                        {isCoreAssignmentCompleted && (
                            <Text style={styles.completedText}>Kernopdracht voltooid</Text>
                        )}
                    </View>
                )}
                {Object.keys(groupedActivities).map(group => (
                    <View key={group} style={styles.groupContainer}>
                        <Text style={styles.groupTitle}>{group}</Text>
                        {groupedActivities[group].map((activity, index) => (
                            <View key={index} style={styles.activityInfo}>
                                <Text style={styles.activityName}>{activity.activity_name}</Text>
                                <Text style={styles.activityLevel}>Level: {activity.level} - {activity.level * 5} punten</Text>
                                {activity.status === 'not_started' && isNextActivityStartable(groupedActivities[group], index) && (
                                    <TouchableOpacity style={styles.button} onPress={() => startActivity(activity.id)}>
                                        <Text style={styles.buttonText}>Starten</Text>
                                    </TouchableOpacity>
                                )}
                                {activity.status === 'started' && (
                                    <TouchableOpacity style={styles.button} onPress={() => completeActivity(activity.id, activity.level)}>
                                        <Text style={styles.buttonText}>Inleveren</Text>
                                    </TouchableOpacity>
                                )}
                                {activity.status === 'completed' && (
                                    <Text style={styles.completedText}>Voldaan</Text>
                                )}
                                {activity.status === 'not_completed' && (
                                    <TouchableOpacity style={styles.button} onPress={() => completeActivity(activity.id, activity.level)}>
                                        <Text style={styles.buttonText}>Opnieuw Inleveren</Text>
                                    </TouchableOpacity>
                                )}
                                {activity.status === 'submitted' && (
                                    <Text style={styles.submittedText}>Ingeleverd</Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </View>
            {conceptChallenge && (
                <View style={styles.challengeContainer}>
                    <Text style={styles.challengeTitle}>Concept Challenge</Text>
                    <Text style={styles.challengeName}>{conceptChallenge.challenge_name}</Text>
                    <Text style={styles.challengeDescription}>{conceptChallenge.description}</Text>
                    <Text style={styles.challengePoints}>
                        {totalPoints < 100 ? `Nog ${100 - totalPoints} punten nodig om de concept uitdaging the ontgrendelen` : 'Je kunt nu de concept uitdaging voltooien!'}
                    </Text>
                    {totalPoints >= 100 && !isConceptChallengeCompleted && (
                        <TouchableOpacity style={styles.button} onPress={completeConceptChallenge}>
                            <Text style={styles.buttonText}>Concept uitdaging voltooien</Text>
                        </TouchableOpacity>
                    )}
                    {isConceptChallengeCompleted && (
                        <Text style={styles.submittedText}>Concept uitdaging Ingeleverd</Text>
                    )}
                </View>
            )}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Terug naar Modules</Text>
            </TouchableOpacity>
            <Footer />
        </View>
    );
}

const window = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        margin: 0,
        backgroundColor: "rgb(247, 243, 231)"
    },
    contentPage: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 20,
    },
    groupContainer: {
        flexBasis: '45%',
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
        margin: '2.5%',
    },
    groupTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },
    activityInfo: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        backgroundColor: '#fff'
    },
    activityName: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    activityLevel: {
        fontSize: 16,
        color: 'gray'
    },
    button: {
        backgroundColor: '#BB1515',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    completedText: {
        color: 'green',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submittedText: {
        color: 'orange',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: '5%',
        textAlign: "center"
    },
    pointsText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    progressBarContainer: {
        width: '80%',
        height: 20,
        backgroundColor: '#e0e0df',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#BB1515',
        borderRadius: 10,
    },
    progressText: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 20,
    },
    challengeContainer: {
        padding: 20,
        marginTop: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
        alignSelf: 'center',
    },
    challengeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    challengeName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    challengeDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    challengePoints: {
        fontSize: 16,
        textAlign: 'center',
        color: 'gray',
        marginBottom: 10,
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
    },
    notStartedText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    }
});

export default ActivitiesPage;
