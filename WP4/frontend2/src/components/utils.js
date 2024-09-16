import jwt_decode from 'jwt-decode';

export const getGreeting = () =>{
    const currentHour = new Date().getHours()

    if (currentHour < 12) {
        return 'Good morning'
    } else if (currentHour < 18) {
        return 'Good afternoon'
    } else {
        return 'Good evening'
    }
}

export const getUserName = () => {
    try{
        const decoded = jwt_decode(token)
        return decoded.username
    } catch (error) {
        console.error('Invalid token', error)
        return null
    }
}