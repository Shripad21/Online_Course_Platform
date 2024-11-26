import React from 'react'
import {useDispatch} from 'react-redux'
import authService from '../../appwrite/auth'
import {logout} from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        authService.logout()
        .then(() => {dispatch(logout())})
        .catch((error) => console.log('LogoutBtn error : ', error))
        .finally(() => console.log('logout successful!'))
    }
    return (
      <button 
          className="inline-block px-6 py-2 bg-red-500 text-white duration-200 hover:bg-red-600 rounded-lg" 
          onClick={logoutHandler}
      >
          Logout
      </button>
  );  
}

export default LogoutBtn