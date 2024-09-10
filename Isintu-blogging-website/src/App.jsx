
import React, { useState, useEffect } from 'react';
import Loading from './Components/Loading';
import UserLogin from './Components/UserLogin';
import UserRegistration from './Components/UserRegistration';
import {Routes, Route} from 'react-router-dom';
import Dashboard from './Components/Dashboard';


const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000); 
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
  <>
    <Routes>
      <Route path='/' element={<UserRegistration />} />
      <Route path='/login' element={<UserLogin />} />
      <Route path='/dashboard' element = {<Dashboard />} />
    </Routes>
    
    </>
  

  );
};

export default App;

