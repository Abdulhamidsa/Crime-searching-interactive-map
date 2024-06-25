# Crimes Map

## Description
This project sets up a Docker environment using Docker Compose with Python and ArangoDB.

## Prerequisites
- Docker
- Docker Compose

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Abdulhamidsa/Crime-searching-interactive-map
   cd backend
   docker-compose up --build
This command builds the Docker images defined in docker-compose.yml and starts the containers.

To run the frontend part
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

