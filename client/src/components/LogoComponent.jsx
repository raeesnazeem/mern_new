import React from 'react';
import logo from '../assets/growth99-black-logo.svg'; 

const LogoComponent = () => {
  return (
    <div>
      <img src={logo} alt="Growth99 Logo" style={{ minWidth: '150px', height: 'auto', position:"fixed", top:"5%", left:"5%"}} />
    </div>
  );
};

export default LogoComponent;