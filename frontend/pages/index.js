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
import styles from "@/styles/Home.module.css";
import { Marker, Popup, Source, Layer } from "react-map-gl";
import { v4 as uuidv4 } from "uuid";
import CrimeDetailsDrawer from "@/components/CrimeDetailsDrawer";
import FilterDrawer from "@/components/FilterDrawer";
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
import CrimeMap from "@/components/CrimeMap";
function HomePage({ data }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [location, setLocation] = useState({ latitude: 55.6761, longitude: 12.5683, zoom: 10 });
  const [showSuspects, setShowSuspects] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [suspects, setSuspects] = useState(null);
  const [selectedGender, setSelectedGender] = useState([]);
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

  return (
    <>
      <Box className={styles.main_container}>
        {!suspects && !selectedCrime && (
          <Button position="absolute" top="10" left="50%" transform="translate(-50%, -50%)" zIndex="55555" onClick={updateMap}>
            UPDATE CRIMES
          </Button>
        )}
        <CrimeMap location={location} crimes={filteredCrimes} selectedCrime={selectedCrime} handleOpen={handleOpen} showSuspects={showSuspects} suspects={suspects} handleReturnToMap={handleReturnToMap} />
        <FilterDrawer selectedCrime={selectedCrime} selectedType={selectedType} setSelectedType={setSelectedType} selectedSeverity={selectedSeverity} setSelectedSeverity={setSelectedSeverity} selectedGender={selectedGender} setSelectedGender={setSelectedGender} />
        <CrimeDetailsDrawer isOpen={isOpen} onClose={handleClose} selectedCrime={selectedCrime} handleSuspects={handleSuspects} />
      </Box>
      <Button className={styles.update_data_button}>CHECK FOR UPDATED DATA</Button>
    </>
  );
}
export default HomePage;
