import { useState } from "react";
import { Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, DrawerFooter, Button, VStack, Menu, MenuButton, MenuList, MenuItem, Icon, Checkbox, CheckboxGroup, Text, Box } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import * as FaIcons from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { useDisclosure } from "@chakra-ui/react";
import styles from "@/styles/Home.module.css";
export default function FilterDrawer({ selectedCrime, selectedType, setSelectedType, selectedSeverity, setSelectedSeverity, selectedGender, setSelectedGender }) {
  const [key, setKey] = useState(0);
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const resetFilters = () => {
    setSelectedType("");
    setSelectedSeverity("");
    setSelectedGender([]);
    setKey((prevKey) => prevKey + 1);
  };
  return (
    <>
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
    </>
  );
}
