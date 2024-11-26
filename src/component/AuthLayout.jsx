import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'

export default function Protected({children, authentication = true, }) {
    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        // TODO ....
        if(authentication && authStatus !== authentication){
            navigate('/login')
        } else if(!authentication && authStatus !== authentication){
            navigate('/')
        }
        setLoader(false)
    },[authStatus, navigate, authentication])
    return loader ? (
        <h1 className="text-center text-2xl font-semibold text-gray-600 py-10">Loading...</h1>
    ) : (
        <>{children}</>
    );
    
}