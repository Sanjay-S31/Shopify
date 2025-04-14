import { useState } from 'react'

export const useSignup = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const [success, setSuccess] = useState(false)

    const signup = async (username, email, password, userType) => {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        const response = await fetch('/api/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, email, password, userType})
        })

        const jsonData = await response.json()

        if (!response.ok) {
            setError(jsonData.error)
            setIsLoading(false)
        }

        if (response.ok) {
            // Instead of logging in automatically, just set success to true
            setSuccess(true)
            setIsLoading(false)
            setError(null)
            // We don't store user in localStorage or update context here
        }
    }

    return { signup, error, isLoading, success }
}