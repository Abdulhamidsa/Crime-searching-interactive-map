# Crimes Map

## Description
This project sets up a Docker environment using Docker Compose with Python and ArangoDB.
This project showcase an interactive map for crimes located in Copenhagen and their data(criminals, victims, potential other gang members), relying on complex AQL queries and logic.

## Prerequisites
- Docker
- Docker Compose

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Abdulhamidsa/Crime-searching-interactive-map
   ````
2. To run the backend:
   ```bash
   cd backend
   docker-compose up --build
   ```
3. To run the frontend:
   ```bash
    cd frontend
    npm install
    npm run dev
   ```

## Access the services:
Python Application: Access at http://localhost:80  
ArangoDB: Access ArangoDB web interface at http://localhost:8529  
Next.js Application: Access the application at http://localhost:3000


## Additional Notes
This setup uses Docker Compose version 3.1.
Ensure Docker and Docker Compose are installed and running on your machine.
Adjust ports and paths as needed in docker-compose.yml.

