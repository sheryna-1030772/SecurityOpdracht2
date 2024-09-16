import React, { useState, useEffect } from "react"

export default function IpAddress() {
    const [ip, setIp] = useState('')

    useEffect(() => {
        fetch(`config.json`)
            .then(response => response.json())
            .then(data => {
                setIp(data.ip_address)
            })
            .catch(error => {
                console.error('Error fetching ip:', error)
            })
    }, [])

    return ip
}