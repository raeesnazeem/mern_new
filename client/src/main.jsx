import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router.jsx'; 
import './App.css'; 
import './styles/Customchatbot.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(

    <RouterProvider router={router} />

);