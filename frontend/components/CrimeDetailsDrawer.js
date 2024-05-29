import { Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, Box, VStack, Table, Thead, Tr, Th, Tbody, Td, Text, HStack, Button } from "@chakra-ui/react";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

const CrimeDetailsDrawer = ({ isOpen, onClose, selectedCrime, handleSuspects }) => {
  return (
    <Drawer size="md" isOpen={isOpen} onClose={onClose} placement="right">
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
  );
};
export default CrimeDetailsDrawer;
