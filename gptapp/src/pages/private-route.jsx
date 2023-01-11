import React from "react";
import { useAuth } from "../commons/use-auth";
import {
    Navigate,
    useLocation
  } from "react-router-dom";


function isTokenExpired(exptime){
  let d1=  new Date();
  let d2 = new Date(d1.getUTCFullYear(),
				  d1.getUTCMonth(),
				  d1.getUTCDate(),
				  d1.getUTCHours(),
				  d1.getUTCMinutes(),
				  d1.getUTCSeconds())
   const current = Number(d2)/1000;
   return current>exptime;
}

export default function RequireAuth({ children,redirectPath }) {
    //use context
  const auth = useAuth();
  // console.log(auth);
 
  let isAuthenticated = false;
  let istokenExpired = false;
  let exp = 0;
  if(!auth.user){
    isAuthenticated = false;
  }
  else{
    // console.log('auth:',JSON.stringify(auth.user));
    isAuthenticated = auth.user.isAuthorized;
    // exp = auth.user.context.payload.exp;
    // istokenExpired = isTokenExpired(exp);
  }
  const location = useLocation();
  if (isAuthenticated && (!istokenExpired)) {
    return children;
  }else
    return <Navigate to={redirectPath} state={{ from: location }} />;
  };