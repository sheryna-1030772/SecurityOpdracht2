import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Notification = ({ message, visible }) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'green',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    message: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Notification;
