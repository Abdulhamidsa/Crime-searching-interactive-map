import MapGL, { Marker, Source, Layer, Popup } from "react-map-gl";
import { Box, Button, Icon, Text } from "@chakra-ui/react";
import "mapbox-gl/dist/mapbox-gl.css";
import { v4 as uuidv4 } from "uuid";
import * as FaIcons from "react-icons/fa";
import styles from "@/styles/Home.module.css";

export default function CrimeMap({ location, crimes, selectedCrime, handleOpen, showSuspects, suspects, handleReturnToMap }) {
  return (
    <>
      <MapGL
        key={`${location.latitude},${location.longitude}`}
        initialViewState={{
          latitude: location.latitude,
          longitude: location.longitude,
          zoom: location.zoom,
          minZoom: 6,
          maxZoom: 17,
        }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        keyboard={true}
        interactive={true}
      >
        {showSuspects && (
          <Button position="absolute" top="10" left="50%" transform="translate(-50%, -50%)" zIndex="55555" className={styles.return_to_map_button} onClick={handleReturnToMap}>
            RETURN TO MAP
          </Button>
        )}
        {crimes && (
          <>
            {suspects && (
              <Source
                id="route"
                type="geojson"
                data={{
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: [[parseFloat(selectedCrime.crime_location.longitude), parseFloat(selectedCrime.crime_location.latitude)], ...suspects.map((suspect) => [parseFloat(suspect.location.longitude), parseFloat(suspect.location.latitude)])],
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
            )}
            {(selectedCrime ? [selectedCrime] : crimes).map((crime) => (
              <Marker key={uuidv4()} latitude={parseFloat(crime.crime_location.latitude)} longitude={parseFloat(crime.crime_location.longitude)}>
                <Box onClick={!suspects ? () => handleOpen(crime) : undefined}>
                  {crime.crime_type === "Robbery" && <Icon className={styles.icons_map} as={FaIcons.FaUserSecret} />}
                  {crime.crime_type === "Murder" && <Icon className={styles.icons_map} as={FaIcons.FaSkullCrossbones} />}
                  {crime.crime_type === "Cybercrime" && <Icon className={styles.icons_map} as={FaIcons.FaLaptop} />}
                  {crime.crime_type === "Sex Trafficking" && <Icon className={styles.icons_map} as={FaIcons.FaUsers} />}
                </Box>
              </Marker>
            ))}
            {showSuspects &&
              suspects &&
              suspects.map((suspect, index) => (
                <Marker key={index} latitude={parseFloat(suspect.location.latitude)} longitude={parseFloat(suspect.location.longitude)}>
                  <Box>
                    <Icon className={styles.icons_map} as={FaIcons.FaMapMarkerAlt} />
                  </Box>
                  <Popup latitude={parseFloat(suspect.location.latitude)} longitude={parseFloat(suspect.location.longitude)} closeButton={false} closeOnClick={false} offsetTop={-10}>
                    <Box>
                      <Text>
                        Name: {suspect.first_name} {suspect.last_name}
                      </Text>
                      <Text>Gender: {suspect.gender}</Text>
                      <Text>Age: {suspect.age}</Text>
                      <Text>Crime history: {suspect.criminal_history}</Text>
                      {selectedCrime && selectedCrime.criminal.last_name === suspect.last_name && <Text>Potential Family Member.</Text>}
                    </Box>
                  </Popup>
                </Marker>
              ))}
          </>
        )}
      </MapGL>
    </>
  );
}
