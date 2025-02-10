import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useSignup = () => {

    const [error,setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const {dispatch} = useAuthContext()

    const signup = async (username, email, password, userType) => {

        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/user/signup' , {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({username,email,password,userType})
        })

        const jsonData = await response.json()

        if(!response.ok){
            setError(jsonData.error)
            setIsLoading(false)
        }

        if(response.ok){
            localStorage.setItem('user' , JSON.stringify(jsonData))

            // update the auth context
            dispatch({type : 'LOGIN' , payload : jsonData})

            setIsLoading(false)
            setError(null)

        }
    }


    return {signup , error , isLoading}
}