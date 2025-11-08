import { Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

const MapMarker = ({ toilet }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <Marker
        position={{ lat: toilet.lat, lng: toilet.lng }}
        title={toilet.name}
        onClick={() => setShowInfo(true)}
      />
      {showInfo && (
        <InfoWindow
          position={{ lat: toilet.lat, lng: toilet.lng }}
          onCloseClick={() => setShowInfo(false)}
        >
          <div>
            <strong>{toilet.name}</strong><br />
            Rating: {toilet.rating}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default MapMarker;
