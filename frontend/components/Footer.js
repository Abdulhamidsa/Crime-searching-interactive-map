import { Box, Flex, Text, Link } from "@chakra-ui/react";
import styles from "@/styles/Home.module.css";

function Footer() {
  return (
    <Box as="footer" role="contentinfo" mx="auto" maxW="7xl" py="12" px={{ base: "4", md: "8" }}>
      <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
        <Text fontSize="sm" color="gray.500">
          &copy; {new Date().getFullYear()} Your Copany. All rights reserved.
        </Text>
        <Flex direction={{ base: "column", md: "row" }} align="center">
          <Link href="#" fontSize="sm" color="gray.500" ml={{ md: "6" }}>
            Privacy Policy
          </Link>
          <Link href="#" fontSize="sm" color="gray.500" ml={{ md: "6" }}>
            Terms of Service
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Footer;
