import { Box, Button, Divider, VStack, HStack, Drawer, DrawerOverlay, DrawerContent, DrawerFooter, DrawerCloseButton, DrawerHeader, DrawerBody, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import { useState } from "react";
import MapGL from "react-map-gl"; // Import MapGL instead of Map
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "@/styles/Home.module.css";
import { Marker, Source, Layer } from "react-map-gl";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

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
  // const [selectedCrimeId, setSelectedCrimeId] = useState(null);
  const [loading, setLoading] = useState(null);
  const [location, setLocation] = useState({ latitude: 55.6761, longitude: 12.5683, zoom: 10 });
  const [showSuspects, setShowSuspects] = useState(false);
  // const [selectedCrimeType, setSelectedCrimeType] = useState(null);
  // console.log(selectedCrime);
  // console.log(selectedCrimeId);
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

  const handleClose = () => {
    setSelectedCrime(false);
    setShowSuspects(false);
    onClose();
  };

  const handleSuspects = () => {
    setLocation({ latitude: 56.2639, longitude: 9.5018, zoom: 7 });
    setShowSuspects(true);
    onClose();
  };
  const handleReturnToMap = () => {
    setLocation({ latitude: 55.6761, longitude: 12.5683, zoom: 10 });
    setShowSuspects(false);

    onOpen();
  };
  // console.log(location);
  const getColorFromSeverity = (severity) => {
    const colorScale = ["#4CAF50", "#8BC34A", "#FFEB3B", "#FF9800", "#F44336"];
    const index = Math.min(severity, colorScale.length) - 1;
    return colorScale[index];
  };
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Box className={styles.main_container}>
        <Box className={styles.map_container}>
          <MapGL
            key={`${location.latitude},${location.longitude}`}
            initialViewState={{
              latitude: location.latitude,
              longitude: location.longitude,
              zoom: location.zoom,
              minZoom: 6,
              maxZoom: 17,
            }}
            mapStyle="mapbox://styles/mapbox/satellite-v9"
            mapboxAccessToken={mapboxToken}
            keyboard={true}
            interactive={true}
          >
            <Button className={styles.reutn_to_map_button} onClick={handleReturnToMap}>
              Return Tdo Map
            </Button>
            {data && (
              <>
                <Source
                  id="route"
                  type="geojson"
                  data={{
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: (selectedCrime ? [selectedCrime] : data).map((crime) => [parseFloat(crime.longitude), parseFloat(crime.latitude)]),
                    },
                  }}
                >
                  <Layer
                    id="route"
                    type="line"
                    source="route"
                    layout={{
                      "line-join": "round",
                      "line-cap": "round",
                    }}
                    paint={{
                      "line-color": "white",
                      "line-width": 4,
                    }}
                  />
                </Source>
                {(selectedCrime ? [selectedCrime] : data).map((crime) => (
                  <Marker key={uuidv4()} latitude={parseFloat(crime.latitude)} longitude={parseFloat(crime.longitude)}>
                    <Box onClick={() => handleOpen(crime)}>
                      <svg height="20" viewBox="0 0 24 24" fill={getColorFromSeverity(crime.severity)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </Box>
                  </Marker>
                ))}
                {showSuspects &&
                  selectedCrime.associates &&
                  selectedCrime.associates.map((associate, index) => (
                    <Marker key={index} latitude={parseFloat(associate.latitude)} longitude={parseFloat(associate.longitude)}>
                      <Box>
                        <svg height="20" viewBox="0 0 24 24" fill="blue" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </Box>
                    </Marker>
                  ))}
              </>
            )}
          </MapGL>
        </Box>

        <Drawer size="md" isOpen={isOpen} onClose={handleClose} placement="right">
          <DrawerOverlay>
            <DrawerContent className={styles.drawer}>
              <DrawerCloseButton />
              <DrawerHeader m="auto" fontSize="30px">
                Crime Details
              </DrawerHeader>
              <DrawerBody>
                {selectedCrime && (
                  <>
                    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} mb={5}>
                      <Image className={styles.criminal_image} width={200} height={200} src={selectedCrime.criminal.avatar} alt={selectedCrime.criminal.first_name} />
                      <Text fontSize="2.5rem" textAlign="center" fontWeight="">
                        {selectedCrime.criminal.first_name} {selectedCrime.criminal.last_name}
                      </Text>
                      <Divider my={4} />
                      <VStack align="start" spacing={2} mt={5}>
                        <Text fontWeight="">Crime ID: {selectedCrime.crime_id}</Text>
                        <Text fontWeight="">Crime Type: {selectedCrime.crime_type}</Text>
                        <Text fontWeight="">Description: {selectedCrime.description}</Text>
                        <Text mt="4" fontSize="1.25rem" fontWeight="bold">
                          Victims:
                        </Text>
                        <HStack w="full" justify="flex-start" align="center" spacing={5}>
                          {selectedCrime.victims.map((victim, index) => (
                            <Box key={index}>
                              <Image m="auto" width={120} height={120} src={victim.avatar} alt={victim.first_name} />
                              <Box textAlign="center">
                                <Text>
                                  {victim.first_name} {victim.last_name}
                                </Text>
                              </Box>
                            </Box>
                          ))}
                        </HStack>

                        <Divider my={4} />

                        <Button alignSelf="center" onClick={handleSuspects}>
                          Display Suspected Gang Members
                        </Button>
                      </VStack>
                    </Box>
                  </>
                )}
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      </Box>
    </>
  );
}

export default HomePage;
