
import React from 'react';

const Loading = () => {
  return (
    <div style={{ display: 'flex',flexDirection:"column" ,justifyContent: 'center', alignItems: 'center', height: '100vh' , marginBottom: '15rem'}}>
        <div className='logo'>
            <img className='logo' src='./finalImage2.png'></img>
        </div>
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;
