import { useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Table,
  Thead,
  Tr,
  Th,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  Drawer,
  Tbody,
  Td,
  SliderThumb,
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
  Divider,
  Select,
} from "@chakra-ui/react";
import MapGL from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MdFilterList, MdOutlineRobbery, MdOutlineCrime, MdOutlineComputer, MdOutlinePeopleAlt } from "react-icons/md";
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
  console.log(data);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [location, setLocation] = useState({ latitude: 55.6761, longitude: 12.5683, zoom: 10 });
  const [showSuspects, setShowSuspects] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const [suspects, setSuspects] = useState(null);
  const [selectedGender, setSelectedGender] = useState([]);
  // const [selectedAge, setSelectedAge] = useState("");
  const [key, setKey] = useState(0);
  const filteredCrimes = data.filter((crime) => {
    // const age = crime.criminal.age;
    // const [minAge, maxAge] = selectedAge.split("-").map(Number);

    return (selectedType === "" || crime.crime_type === selectedType) && (selectedSeverity === "" || crime.severity === selectedSeverity) && (selectedGender.length === 0 || selectedGender.includes(crime.crime_perpetrator.gender));
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
  // const getColorFromSeverity = (severity) => {
  //   const colorScale = ["#4CAF50", "#8BC34A", "#FFEB3B", "#FF9800", "#F44336"];
  //   const index = Math.min(severity, colorScale.length) - 1;
  //   return colorScale[index];
  // };
  const resetFilters = () => {
    setSelectedType("");
    setSelectedSeverity("");
    setSelectedGender([]);
    setKey((prevKey) => prevKey + 1);
  };
  console.log(selectedCrime);
  console.log(suspects);
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
            mapStyle="mapbox://styles/mapbox/satellite-streets-v9"
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
                      {/* <Menu>
                        <MenuButton className={styles.filter_button} textAlign="left" as={Button} rightIcon={<ChevronDownIcon />}>
                          {`Age : ${selectedAge || "All"}`}
                        </MenuButton>
                        <MenuList p="0" className={styles.filter_button}>
                          <MenuItem p="2" className={styles.filter_button_drop} onClick={() => setSelectedAge("")}>
                            All
                          </MenuItem>

                          <MenuItem p="2" className={styles.filter_button_drop} value="20-30" onClick={() => setSelectedAge("20-30")}>
                            20-30
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} value="30-40" onClick={() => setSelectedAge("30-40")}>
                            30-40
                          </MenuItem>
                          <MenuItem p="2" className={styles.filter_button_drop} value="40-50" onClick={() => setSelectedAge("40-50")}>
                            40-50
                          </MenuItem>
                        </MenuList>
                      </Menu> */}
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
              <Button className={styles.reutn_to_map_button} onClick={handleReturnToMap}>
                Return To Map
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
                {showSuspects &&
                  suspects &&
                  suspects.map((suspect, index) => (
                    <Marker key={index} latitude={parseFloat(suspect.location.latitude)} longitude={parseFloat(suspect.location.longitude)}>
                      <Box>
                        <Icon className={styles.icons_map} as={FaIcons.FaMapMarkerAlt} />
                      </Box>
                      <Popup
                        latitude={parseFloat(suspect.location.latitude)}
                        longitude={parseFloat(suspect.location.longitude)}
                        closeButton={false}
                        closeOnClick={false}
                        offsetTop={-10} // Adjust this value as needed
                      >
                        <Box>
                          <Text>
                            Name: {suspect.first_name} {suspect.last_name}
                          </Text>
                          <Text>Gender: {suspect.gender}</Text>
                          <Text>Age: {suspect.age}</Text>
                          <Text>Crime history: {suspect.criminal_history}</Text>
                          {selectedCrime && selectedCrime.crime_perpetrator.last_name === suspect.last_name && <Text>Potential Family Member.</Text>}
                        </Box>
                      </Popup>
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
                    <Box m="auto" overflow="hidden" p={0} mb={5}>
                      <Image className={styles.crime_perpetrator} width={300} height={300} src={selectedCrime.crime_perpetrator.avatar} alt={selectedCrime.crime_perpetrator.first_name} />
                      <Text fontSize="2.5rem" textAlign="center" fontWeight="">
                        {selectedCrime.crime_perpetrator.first_name} {selectedCrime.crime_perpetrator.last_name}
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
                              <Td>{selectedCrime.crime_id}</Td>
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
                        <Button alignSelf="flex-start" onClick={() => handleSuspects(selectedCrime.crime_perpetrator.id)}>
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
