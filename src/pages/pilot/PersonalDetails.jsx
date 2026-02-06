import React, { useEffect, useState } from 'react';
import { pilotService } from '@/services';
import { FlightLoadingGIF } from '@/assets';
import Header from '@/components/pilotComponent/Header';

const PersonalDetails = () => {
  const [personalDetails, setPersonalDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        setLoading(true);
        const response = await pilotService.getPersonalDetails("6S4dJ1n1rIQeBynqdFjUHdj0Qgr2");
        setPersonalDetails(response?.PersonalDetails?.[0] || {});
      } catch (err) {
        console.error('Failed to fetch personal details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalDetails();
  }, []);

  if (!personalDetails) return <p>No personal details available</p>;
  return (
    <>
      <Header />
      {loading ? (
        <div className="flex justify-center p-8">
          <img src={FlightLoadingGIF} alt="Loading..." className="" />
        </div>
      ) : (
        <div className="mx-auto p-4 max-w-4xl bg-surfaceBase shadow rounded-lg">
          <div className="bg-primary text-surfaceBase p-4">
            <h2 className="text-2xl font-semibold">Personal Details</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalDetails && Object.entries(personalDetails).map(([key, value]) => (
              <div key={key} className="flex justify-between bg-gray-50 p-2 rounded">
                <span className="text-surfaceMuted">{key.replace(/_/g, ' ')} : </span>
                <span className="font-medium">{value ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(PersonalDetails);
