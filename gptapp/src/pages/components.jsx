import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MenuIcon from '@mui/icons-material/Menu';
import { grey } from '@mui/material/colors';



export const TopNavHeader =()=>{
return (
    <Box
      sx={{
        width: '100%',
        height: 36,
        p:0.5,
        fontSize: '0.875rem',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        display: 'flex',
        color: grey[100],
        justifyContent: 'space-between',
        backgroundColor:'primary.dark',
         fontWeight: '700',
      }}
    >
     <IconButton aria-label="back" size="small" href='/'>
        <ArrowBackIosIcon sx={{ color: grey[100] }}/>
      </IconButton>
    <Box>{"AI ChatBot"}</Box>
    <IconButton aria-label="menu">
        <MenuIcon  sx={{ color: grey[100] }}/>
      </IconButton>
    </Box>
)
}

