
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const navigate = useNavigate();
  
  // Automatically redirect to the home page
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  // Render the Home component directly
  return <Home />;
};

export default Index;
