import React, { useState, useRef, useEffect,useMemo } from "react";
import { TopNavHeader } from "./components";
import { deepOrange, deepPurple, lightGreen, grey } from "@mui/material/colors";
import {getAnswer} from '../commons/apigw';
import {
  Box,
  Stack,
  Avatar,
  Button,
  OutlinedInput,
  List,
  ListItem,
} from "@mui/material";
import ContactlessIcon from "@mui/icons-material/Contactless";
import { Formik, Form, useFormik } from "formik";
import { useAuthorizedHeader } from "../commons/use-auth";

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
};

const BOTNAME = 'AI';

function stringToColor(string) {
  let hash = 0;
  let i;
  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */
  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    //   children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    children: name[0] + name[name.length - 1],
  };
}

const MsgItem = ({ who, text }) => {
  return who !== BOTNAME? (
    <ListItem sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <TextItem sx={{ bgcolor: lightGreen[400] }}> {text}</TextItem>
        <Avatar {...stringAvatar(who)} />
      </Stack>
    </ListItem>
  ) : (
    <ListItem>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Avatar {...stringAvatar(who)} />
        <TextItem> {text}</TextItem>
      </Stack>
    </ListItem>
  );
};

const TextItem = (props) => {
  const { sx, ...other } = props;
  return (
    <Box
      sx={{
        p: 1.2,
        // m: 1.2,
        whiteSpace: "normal",
        bgcolor: grey[100],
        color: grey[800],
        border: "1px solid",
        borderColor: grey[300],
        borderRadius: 2,
        fontSize: "0.875rem",
        fontWeight: "700",
        ...sx,
      }}
      {...other}
    />
  );
};

const ChatBox = ({ msgItems,loading }) => {
 const [loadingtext,setLoaderTxt] = useState('.');
    useEffect(()=>{
      let textContent = '';
      setInterval(() => {
          setLoaderTxt( v=> v+'.');
          textContent+='.';
          if (textContent.length > 5) {
              setLoaderTxt('');
              textContent='';
          }
      }, 500);
    },[]);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behaviour: "smooth" });
    }
  }, [msgItems]);
  const items = msgItems.map((msg) => (
    <MsgItem key={msg.id} who={msg.who} text={msg.text} />
  ));

  return (

  <List
   sx={{ 
        position: 'relative',
        overflow: 'auto',
            height:750,
        // width:'100%',
        }}
  >{items}
  {loading? <MsgItem who={BOTNAME} text={loadingtext} />:<div/>}
  <ListItem ref={scrollRef} />
  </List>
  );
};

const InputSection = ({ setmsgItems,setLoading }) => {
  const username = "RiverX";
  const [conversations,setConversations] = useState([]);
//   console.log(conversations) ;
  const authheader = useAuthorizedHeader();
  const formik = useFormik({
    initialValues: {
      prompt: "",
    },
    onSubmit: (values) => {
      if (values.length === 0){
        return;
      }
      const respid = generateUniqueId();
      setmsgItems((prev) => [
        ...prev,
        { id: respid, who: username, text: values.prompt },
      ]);

      //save conversations
      setConversations((prev)=>[...prev,values.prompt]);
      const prompt = conversations.join(" ")+"\n\n"+values.prompt;
      formik.resetForm();
    //   return;
      setLoading(true);
      getAnswer(respid,prompt,authheader)
        .then(data => {
            // console.log(data);
            //save conversations
            setConversations(prev=>[...prev,data.bot]);
            setLoading(false);
            setmsgItems((prev) => [...prev,{ id: generateUniqueId(), who:BOTNAME, text: data.bot.trim() }]
            );
        }).catch(err =>{ 
            // console.table(err);
            setLoading(false);　
            setConversations([]);
            setmsgItems((prev) => [...prev,{ id: generateUniqueId(), who:BOTNAME, text:'Ops! '+err.message}]);
        })
    },
  });

  return (
    <Formik>
      <Form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            display: "grid",
            borderTop: 1,
            p: 1,
            gap: 1,
            bgcolor: grey[50],
            borderColor: grey[400],
            alignItems: "center",
            gridTemplateColumns: "24px 70% 15%",
            position:'fixed',
            width:'100%',
            bottom:0,
          }}
        >
          <ContactlessIcon/>
          <OutlinedInput 
            sx={{bgcolor: "white",}}
            value={formik.values.prompt}
            onChange={(event) => {
              formik.setValues({ prompt: event.target.value });
            }}
            multiline
            placeholder="Please enter text"
          />

          <Button variant="contained" type="submit">
            Send
          </Button>
        </Box>
      </Form>
    </Formik>
  );
};
const ChatPage = () => {
  const [msgItems, setmsgItems] = useState([
    { id: generateUniqueId(), who: "AIBot", text: "Welcome" },
  ]);
  const [loading,setLoading] = useState(false);
 

//   useMemo(() => {}, []);
  return (

    <Box sx={{display: 'grid',bgcolor:grey[200],
    gridTemplateRows:'40 700 auto',
    }}
    >
      <TopNavHeader />
      <ChatBox  msgItems={msgItems}  loading={loading}/>
      <InputSection  setmsgItems={setmsgItems} setLoading={setLoading} />
      </Box>

  );
};

export default ChatPage;
