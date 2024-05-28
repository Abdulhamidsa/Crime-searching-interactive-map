import { useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Table,
  Thead,
  Tr,
  Th,
  Button,
  Drawer,
  Tbody,
  Td,
  HStack,
  DrawerOverlay,
  DrawerFooter,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  VStack,
  Checkbox,
  CheckboxGroup,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  Box,
  Text,
} from "@chakra-ui/react";
import MapGL from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MdFilterList } from "react-icons/md";
import styles from "@/styles/Home.module.css";
import { Marker, Popup, Source, Layer } from "react-map-gl";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
// SERVERSIDE GET ALL CRIMES FROM DATABASE
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
import * as FaIcons from "react-icons/fa";
function HomePage({ data }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [location, setLocation] = useState({ latitude: 55.6761, longitude: 12.5683, zoom: 10 });
  const [showSuspects, setShowSuspects] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const [suspects, setSuspects] = useState(null);
  const [selectedGender, setSelectedGender] = useState([]);
  const [key, setKey] = useState(0);
  // console.log(data);
  // console.log(selectedCrime);
  // console.log(suspects);
  const filteredCrimes = data.filter((crime) => {
    return (selectedType === "" || crime.crime_type === selectedType) && (selectedSeverity === "" || crime.crime_severity === selectedSeverity) && (selectedGender.length === 0 || selectedGender.includes(crime.criminal.gender));
  });
  const fetchSuspects = async (crime_id) => {
    try {
      const response = await fetch(`/api/getPotentialSuspects?criminal_id=${crime_id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const results = data.result;
      setSuspects(results);
    } catch (error) {
      console.log(error);
    }
  };

  const updateMap = async () => {
    try {
      const response = await fetch(`/api/insertData`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      if (response.status === 200) {
        console.log("Request succeeded with status 200");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleOpen = (crime) => {
    setSelectedCrime(crime);
    onOpen();
  };
  const handleClose = () => {
    setSelectedCrime(null);
    setShowSuspects(false);
    setSuspects(null);
    onClose();
  };
  const handleSuspects = async (crimeId) => {
    fetchSuspects(crimeId);
    setLocation({ latitude: 55.9639, longitude: 9.5018, zoom: 5 });
    setShowSuspects(true);
    onClose();
  };
  const handleReturnToMap = () => {
    setLocation({ latitude: 55.6761, longitude: 12.5683, zoom: 10 });
    setShowSuspects(false);
    setSuspects(null);
    onOpen();
  };
  const resetFilters = () => {
    setSelectedType("");
    setSelectedSeverity("");
    setSelectedGender([]);
    setKey((prevKey) => prevKey + 1);
  };
  return (
    <>
      <Box className={styles.main_container}>
        {!suspects && !selectedCrime && (
          <Button position="absolute" top="10" left="50%" transform="translate(-50%, -50%)" zIndex="55555" onClick={updateMap}>
            UPDATE CRIMES
          </Button>
        )}
        <Box className={styles.map_container}>
          {/* MAP CONFIGURATION */}
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
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            keyboard={true}
            interactive={true}
          >
            <Box position="fixed" left={5} top={5}>
              {!selectedCrime && (
                <Button onClick={onFilterOpen} leftIcon={<Icon as={MdFilterList} />}>
                  Filter
                </Button>
              )}
            </Box>
            <Drawer size="xs" isOpen={isFilterOpen} placement="left" onClose={onFilterClose}>
              <DrawerOverlay>
                <DrawerContent className={styles.drawer}>
                  <DrawerCloseButton />
                  <DrawerHeader>Filter Options</DrawerHeader>
                  <DrawerBody>
                    <VStack flex="flex-start" align="align-items" justify="start">
                      <Menu>
                        <MenuButton className={styles.filter_button} textAlign="left" as={Button} rightIcon={<ChevronDownIcon />}>
                          {`Crime type : ${selectedType || "All"}`}
                        </MenuButton>
                        <MenuList p="0" className={styles.filter_button}>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedType("")}>
                            All
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedType("Robbery")}>
                            <Icon as={FaIcons.FaUserSecret} mr={2} />
                            Robbery
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedType("Murder")}>
                            <Icon as={FaIcons.FaSkullCrossbones} mr={2} />
                            Murder
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedType("Cybercrime")}>
                            <Icon as={FaIcons.FaLaptop} mr={2} /> Cybercrime
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedType("Sex Trafficking")}>
                            <Icon as={FaIcons.FaUsers} mr={2} />
                            Sex Trafficking
                          </MenuItem>
                        </MenuList>
                      </Menu>
                      <Menu>
                        <MenuButton className={styles.filter_button} textAlign="left" as={Button} rightIcon={<ChevronDownIcon />}>
                          {`Severity : ${selectedSeverity || "All"}`}
                        </MenuButton>
                        <MenuList p="0" className={styles.filter_button}>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedSeverity("")}>
                            All
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedSeverity(1)}>
                            1
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedSeverity(2)}>
                            2
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedSeverity(3)}>
                            3
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedSeverity(4)}>
                            4
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedSeverity(5)}>
                            5
                          </MenuItem>
                        </MenuList>
                      </Menu>
                      <CheckboxGroup key={key} value={selectedGender} onChange={setSelectedGender}>
                        <Checkbox value="Male" colorScheme="#fff">
                          Male
                        </Checkbox>
                        <Checkbox value="Female" colorScheme="#fff">
                          Female
                        </Checkbox>
                      </CheckboxGroup>
                    </VStack>
                  </DrawerBody>
                  <DrawerFooter>
                    <Button mr="auto" colorScheme="blue" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </DrawerOverlay>
            </Drawer>
            {showSuspects && (
              <Button position="absolute" top="10" left="50%" transform="translate(-50%, -50%)" zIndex="55555" className={styles.reutn_to_map_button} onClick={handleReturnToMap}>
                RETURN TO MAP
              </Button>
            )}
            {data && (
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
                {/* CRIMES MARKER ON MAP */}
                {(selectedCrime ? [selectedCrime] : filteredCrimes).map((crime) => (
                  <Marker key={uuidv4()} latitude={parseFloat(crime.crime_location.latitude)} longitude={parseFloat(crime.crime_location.longitude)}>
                    <Box onClick={!suspects ? () => handleOpen(crime) : undefined}>
                      {crime.crime_type === "Robbery" && <Icon className={styles.icons_map} as={FaIcons.FaUserSecret} />}
                      {crime.crime_type === "Murder" && <Icon className={styles.icons_map} as={FaIcons.FaSkullCrossbones} />}
                      {crime.crime_type === "Cybercrime" && <Icon className={styles.icons_map} as={FaIcons.FaLaptop} />}
                      {crime.crime_type === "Sex Trafficking" && <Icon className={styles.icons_map} as={FaIcons.FaUsers} />}
                    </Box>
                  </Marker>
                ))}
                {/* SHOW POTENTIAL SUSPECTS WHEN CLICKING THE BUTTON */}
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
        </Box>
        {/* DRAWER FOR THE CRIME DETAILS */}
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
                    <Box m="auto" overflow="hidden" p={0} mb={5}>
                      <Image className={styles.criminal} width={300} height={300} src={selectedCrime.criminal.avatar} alt={selectedCrime.criminal.first_name} />
                      <Text fontSize="2.5rem" textAlign="center" fontWeight="">
                        {selectedCrime.criminal.first_name} {selectedCrime.criminal.last_name}
                      </Text>
                      <VStack align="start" spacing={2} mt={5}>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Property</Th>
                              <Th>Value</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>Crime ID</Td>
                              <Td>{selectedCrime.criminal.crime_id}</Td>
                            </Tr>
                            <Tr>
                              <Td>Crime Type</Td>
                              <Td>{selectedCrime.crime_type}</Td>
                            </Tr>
                            <Tr>
                              <Td>Description</Td>
                              <Td>{selectedCrime.crime_description}</Td>
                            </Tr>
                            <Tr>
                              <Td>Reported time</Td>
                              <Td>{selectedCrime.crime_report_time}</Td>
                            </Tr>
                            <Tr>
                              <Td>Severity</Td>
                              <Td>{selectedCrime.crime_severity}</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                        {/* <Text fontWeight="">Tottal related suspects: {selectedCrime.crime_location.location_name}</Text> */}
                        <Text mt="4" fontSize="1.25rem" fontWeight="bold">
                          Victims:
                        </Text>
                        <HStack w="full" justify="flex-start" align="center" spacing={5} mb={8}>
                          {selectedCrime.crime_victims.map((victim, index) => (
                            <Box key={index}>
                              <Image m="auto" width={100} height={100} src={victim.avatar} alt={victim.first_name} />
                              <Box textAlign="center">
                                <Text>
                                  {victim.first_name} {victim.last_name}
                                </Text>
                              </Box>
                            </Box>
                          ))}
                        </HStack>
                        {/* <Divider my={4} /> */}
                        <Button alignSelf="flex-start" onClick={() => handleSuspects(selectedCrime.criminal.id)}>
                          Potential Related Suspects
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
      <Button className={styles.update_data_button}>CHECK FOR UPDATED DATA</Button>
    </>
  );
}
export default HomePage;
