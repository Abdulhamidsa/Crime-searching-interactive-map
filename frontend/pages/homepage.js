import { Box, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import { useState } from "react";
import MapGL from "react-map-gl"; // Import MapGL instead of Map
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "@/styles/Home.module.css";
import { Marker, Popup } from "react-map-gl";
import { v4 as uuidv4 } from "uuid";

export async function getServerSideProps() {
  try {
    const res = await fetch("http://localhost/get-crimes");
    if (!res.ok) {
      throw new Error(res.status);
    }
    const data = await res.json();
    return {
      props: {
        data,
      },
    };
  } catch (error) {
    console.log("Fetch error: ", error);
    return {
      props: {
        data: null,
      },
    };
  }
}

function HomePage({ data }) {
  console.log(data);
  const mapboxToken = "pk.eyJ1IjoiYWJvb29kc2EiLCJhIjoiY2xtYXcwcDZtMHp3ODNjcXE0YWY4dmNrMyJ9.0sDQp8tgynWP70CQOLZkrw";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [selectedCrimeId, setSelectedCrimeId] = useState(null);
  const [loading, setLoading] = useState(null);

  // const [viewport, setViewport] = useState({
  //   latitude: 55.6761,
  //   longitude: 12.5683,
  //   zoom: 11,
  //   minZoom: 6,
  //   maxZoom: 17,
  // });

  const handleOpen = (crime) => {
    setSelectedCrime(crime);
    onOpen();
  };

  //   const handleZoomIn = () => {
  //     setViewport((prevViewport) => ({
  //       ...prevViewport,
  //       zoom: Math.min(prevViewport.zoom + 1, prevViewport.maxZoom),
  //     }));
  //     console.log("Setting viewport:", viewport);
  //   };

  //   const handleZoomOut = () => {
  //     setViewport((prevViewport) => ({
  //       ...prevViewport,
  //       zoom: Math.max(prevViewport.zoom - 1, prevViewport.minZoom),
  //     }));
  //   };

  const getColorFromSeverity = (severity) => {
    const colorScale = ["#4CAF50", "#8BC34A", "#FFEB3B", "#FF9800", "#F44336"];
    // Map severity value to index in color scale
    const index = Math.min(severity, colorScale.length) - 1;
    return colorScale[index];
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className={styles.map_container}>
        <MapGL
          initialViewState={{
            latitude: 56.2639,
            longitude: 10.5018,
            zoom: 2,
            minZoom: 6,
            maxZoom: 17,
          }}
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          mapboxAccessToken={mapboxToken}
          keyboard={true}
          interactive={true}
        >
          {data && (
            <>
              {data.map((crime) => (
                <Marker key={uuidv4()} latitude={parseFloat(crime.location.latitude)} longitude={parseFloat(crime.location.longitude)}>
                  <Box onClick={() => setSelectedCrimeId(crime.crime_id)}>
                    <svg height="20" viewBox="0 0 24 24" fill={getColorFromSeverity(crime.severity)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </Box>
                  {selectedCrimeId === crime.crime_id && (
                    <Popup latitude={parseFloat(crime.location.latitude)} longitude={parseFloat(crime.location.longitude)} closeButton={true} closeOnClick={false} onClose={() => setSelectedCrimeId(null)} anchor="top">
                      <div>
                        <p>Crime ID: {crime.crime_id}</p>
                        <p>Crime Type: {crime.crime_type}</p>
                        <p>Description: {crime.description}</p>
                      </div>
                    </Popup>
                  )}
                </Marker>
              ))}
              : (
              <>
                <div>thisis</div>
              </>
              )
            </>
          )}
        </MapGL>
      </div>

      {/* <Button onClick={handleZoomIn}>+</Button>
      <Button onClick={handleZoomOut}>-</Button> */}
    </>
  );
}

export default HomePage;
