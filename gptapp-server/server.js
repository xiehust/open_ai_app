import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration,OpenAIApi } from 'openai';
import * as mysql from 'mysql';
import jwt from 'jsonwebtoken';

// const debug =true;

const createToken = (username) => {
    return jwt.sign({username:username}, process.env.TOKEN_KEY,{expiresIn: "2h",});
};


const verifyToken = (req, res, next) => {
    const token =
      req.body.token || req.query.token || req.headers["authorization"];
    // console.log(token.split(' ')[1]);
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token.split(' ')[1], process.env.TOKEN_KEY);
    //   console.log(decoded);
      req.user = decoded;
    } catch (err) {
      return res.status(401).send("Login Expired,please sign in");
    }
    return next();
  };


const queryDb = async (username) => {
    var connection = mysql.createConnection({
      host     : process.env.RDS_HOSTNAME,
      user     : process.env.RDS_USERNAME,
      password : process.env.RDS_PASSWORD,
      database : 'openai_app'
    })
    var sql = 'select * from user_info where username = ?';
    var val = [username];
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

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        isAuthorized: true,
      })
  })

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let resp;
    try {
        resp = await queryDb(req.body.username);
        // console.log(resp);
    }catch(err)
    {   
        console.error('query db error',err);
        return res.status(501).send({
            isAuthorized: false,
            usename:req.body.username,
            msg:'Internal db error',
            token:'',
          })
    }
    if (resp.length === 0){
        // console.log ('%s not exist',username);
        return res.status(403).send({
            isAuthorized: false,
            usename:req.body.username,
            msg:'User not exist',
            token:'',
          })
    }
    const pwd = resp[0]['password'];
    if (pwd === password){
        const new_token = createToken(username);

        return res.status(200).send({
            isAuthorized: true,
            usename:req.body.username,
            token:new_token,
          })
    }else{
        return res.status(403).send({
            isAuthorized: false,
            usename:req.body.username,
            msg:'Invalid credentials',
            token:'',
          })
    }
  })


app.post('/chat',verifyToken,async (req, res) => {
    
    if (req.body.prompt === undefined || req.body.prompt === ''){
        res.status(400).send({
            bot: 'invalid prompt'
          }); 
          return;
    }
    // console.log(req.user);
    const exp = req.user.exp;

    if (debug){
        res.status(200).send({
            bot: req.body.prompt,
            id:req.body.id
          });
        return
    }
    try {
      const prompt = req.body.prompt;
      const respid = req.body.id;
    //   console.log(respid,prompt); 
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0, // Higher values means the model will take more risks.
        max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
        top_p: 1, // alternative to sampling with temperature, called nucleus sampling
        frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
        presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
      });
    //   console.log(response.data.choices[0].text); 
      res.status(200).send({
        bot: response.data.choices[0].text,
        id:respid
      });
  
    } catch (error) {
    //   console.error(JSON.stringify(error));
      res.status(500).send(error || 'Something went wrong');
    }
  });

var server=  app.listen(5001, () => 
{
    var host = server.address().address
    var port = server.address().port
    console.log('AI server started on %s:%s',host,port);
}
);