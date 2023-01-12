// const API_endpoint = 'http://43.207.39.126:5001/';
const API_endpoint = 'http://localhost:5001/'
export const getAnswer = async(respid,text,headers) =>{
    const options ={
        method:'POST',
        headers:headers,
        body:JSON.stringify({id:respid,prompt:text})
    }
    try {
        var resp = await fetch(API_endpoint+'chat', options);
       
        if (!resp.ok){
            const data = await resp.text();
            throw (Error(`Error: ${resp.status},${data}`));
        } 
        var data = await resp.json() ;
        return data;
    } catch (err) {
        throw err;
    }
}

export const loginAuth = async(username,password) =>{
    const options ={
        method:'POST',
        headers:{'Content-Type': 'application/json',},
        body:JSON.stringify({username:username,password:password})
    }
    try {
        var resp = await fetch(API_endpoint+'login', options);
        if (!resp.ok) {
            const data = await resp.json();
            throw (Error(`Error: ${resp.status},${data.msg}`));
        }
        var data = await resp.json() ;
        return data;
    } catch (err) {
        throw err;
    }
}