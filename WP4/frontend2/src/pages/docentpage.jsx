import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGreeting } from "../components/utils";
import { userContext } from "../components/username";

const Header = () => {
    const user = useContext(userContext);
    const [forceUpdate, setForceUpdate] = useState(false);

    useEffect(() => {
        setForceUpdate(prevState => !prevState);
    }, [user]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{getGreeting()}, {user ? user.name : '...'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
    },
});

export default Header;
