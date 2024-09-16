
import React, { createContext, useState, useEffect, Children } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserName } from "./utils";

export const userContext = createContext()

export const userProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const fetchUserFromToken = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken')
                if (token) {
                    const username = getUserName(token)
                    setUser ({ name: username })
                }
            } catch (error) {
                console.error('Error fetching token:', error)
            }
        }
        fetchUserFromToken()
    }, [])
    
    return (
        <userContext.Provider value={user}>
            {children}
        </userContext.Provider>
    )
}

