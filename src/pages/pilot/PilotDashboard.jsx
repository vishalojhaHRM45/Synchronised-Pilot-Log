import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import Header from '@/components/pilotComponent/Header';
import FlightDashboard from '@/components/pilotComponent/FlightDashboard';

const PilotDashboard = () => {
  const { role } = useSelector(state => state.auth);

  useEffect(() => {
    if (role !== "pilot") {
      window.location.href = "/admin/dashboard";
    }
  }, [role]);

  return (
    <div className=" mx-auto">
      <Header />
      <FlightDashboard />
    </div>
  );
};

export default PilotDashboard;