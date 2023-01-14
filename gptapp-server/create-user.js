import * as dotenv from 'dotenv';
import * as mysql from 'mysql';
// import {createToken} from './auth';
import jwt from 'jsonwebtoken';
dotenv.config();

const createToken = (username) => {
    return jwt.sign({username:username},process.env.TOKEN_KEY,{expiresIn: "2h",});
};

const createUser = async (username,password,token) => {
    var connection = mysql.createConnection({
      host     : process.env.RDS_HOSTNAME,
      user     : process.env.RDS_USERNAME,
      password : process.env.RDS_PASSWORD,
      database : 'openai_app'
    })
    var sql = 'insert user_info (username,password,secret) values (?,?,?) on duplicate key update \
                username=values(username),password=values(password), secret=values(secret)';
    var val = [username,password,token];
    var result;
    connection.connect()
    connection.query(sql,val, function (error, results, fields) {
      if (error) throw error
      result = results;
    })

    return new Promise( ( resolve, reject ) => {
        connection.end( err => {
            if ( err )
                return reject( err )
            resolve(result);
        })
    })
}

let username = 'test';
let password = '12345600';
let token = createToken(username);
let resp = await createUser(username,password,token);
console.log(resp);
