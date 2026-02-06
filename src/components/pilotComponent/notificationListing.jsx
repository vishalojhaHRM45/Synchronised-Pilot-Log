import React, { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useDispatch } from 'react-redux';
import CustomPopup from '../common/Popups'
import { useParams, useSearchParams } from 'react-router-dom';
import { markAsRead } from '@/app/features/notificationSlice';
import { notificationService } from '@/services/notificationServices';

const NotificationListing = ({ notifications, crewFlights, fetchCrewFlights, RM_UserId }) => {
  const dispatch = useDispatch();
  const notificationRefs = useRef({});
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [highlightedId, setHighlightedId] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loadingFlights, setLoadingFlights] = useState({});

  useEffect(() => {
    const notificationId = id || searchParams.get('id');

    if (notificationId) {
      const numericId = parseInt(notificationId, 10);
      setHighlightedId(numericId);

      setTimeout(() => {
        const element = notificationRefs.current[numericId];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);
    } else {
      setHighlightedId(null);
    }

    return () => {
      setHighlightedId(null);
    };
  }, [id, searchParams, notifications]);

  const handleNotificationClick = async (notif) => {
    try {
      await notificationService.updateNotification(notif.Id);
      dispatch(markAsRead(notif.Id));
    } catch (error) {
      console.error("Update failed:", error);
    }

    let matchedFlight = crewFlights?.find(f => f?.SubmissionId === notif?.SubmissionId);
    if (matchedFlight) {
      setSelectedFlight(matchedFlight);
      return;
    }

    if (notif?.SubmissionId) {
      try {
        setLoadingFlights(prev => ({ ...prev, [notif.Id]: true }));
        const response = await fetchCrewFlights(notif.SubmissionId);
        const fetchedFlight = response?.CrewFlights?.[0];
        if (fetchedFlight) {
          setSelectedFlight(fetchedFlight);
        }
      } catch (error) {
        console.error("Failed to fetch flight:", error);
      } finally {
        setLoadingFlights(prev => ({ ...prev, [notif.Id]: false }));
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadIds = notifications
        ?.filter(n => !n.Isread)
        ?.map(n => n.Id);

      if (unreadIds.length === 0) return;
      await notificationService.updateNotification(unreadIds);
      dispatch(markAsRead(unreadIds));

    } catch (error) {
      console.error("Mark all failed:", error);
    }
  };

  return (
    <>
      {notifications?.length > 0 && (
        <div className="flex justify-end px-4">
          <span
            onClick={handleMarkAllRead}
            className="text-primary text-sm font-medium cursor-pointer hover:underline"
          >
            Mark All Read
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {notifications?.length > 0 ? (
          notifications?.map((notif, index) => {
            const isHighlighted = highlightedId === notif?.Id;
            const isLoading = loadingFlights[notif.Id];

            return (
              <div
                key={notif.Id || index}
                ref={(elm) => (notificationRefs.current[notif.Id] = elm)}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-500 shadow-sm hover:shadow-md 
                  ${isHighlighted
                    ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-200'
                    : notif.Isread === false
                      ? 'bg-notificationBg border-blue-100'
                      : 'bg-backgroundLight border-blue-100'
                  }`}
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-surfaceBase"></div>
                  ) : (
                    <Bell className="w-4 h-4 text-surfaceBase" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-textPrimary">{notif.title}</p>
                  <p className="text-sm text-textPrimary">{notif.NotificationMessage}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-surfaceBase rounded-xl shadow-md p-4 text-center text-surfaceMuted h-[calc(100vh-80px)] flex items-center justify-center">
            No new notifications yet 🎉
          </div>
        )}
      </div>

      <CustomPopup
        title="Flight Details"
        RM_UserId={RM_UserId}
        flight={selectedFlight}
        onUpdate={fetchCrewFlights}
        isOpen={selectedFlight !== null}
        onClose={() => setSelectedFlight(null)}
      />
    </>
  )
}

export default React.memo(NotificationListing);