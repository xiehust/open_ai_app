import React, { useState, useContext, createContext } from "react";
import { loginAuth } from "./apigw";
const storageName = 'chat-login-token';
const authContext = createContext();
// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
  }

export function useAuthSignout () {
    const auth = useProvideAuth();
    return auth.signout;
}


export function useAuthUserInfo(){
    const auth = useAuth();
    return auth;
  }

export function useAuthorizedHeader(){
    const auth = useAuth();
    // const [local_stored_tokendata,] = useLocalStorage(storageName,null)
    // const authdata = auth.user?auth.user:local_stored_tokendata;
    const token = auth.user?auth.user.token:'';
    return {
            'Content-Type':'application/json;charset=utf-8',
            'Authorization':'Bearer '+token
        };
  }

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext);
  };
  
  // Provider hook that creates auth object and handles state
function useProvideAuth() {
    const [user, setUser] = useState(null);
    // const [local_stored_tokendata,setToken] = useLocalStorage(storageName,null)
    // Wrap any Firebase methods we want to use making sure ...
    // ... to save the user to state.
    const signin = (email, password) => {
      return loginAuth(email,password).then(data => {
        // setToken(data);
        setUser(data);
        return data;
    })
    // .catch(err=> {setUser({isAuthorized:false,msg:err.message});});
    };
  
    const signout = () => {
      // setToken(null);
      return setUser(null);
    };
  
  
    // Return the user object and auth methods
    return {
      user,
      signin,
      signout,
    };
  } 