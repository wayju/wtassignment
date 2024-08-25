# Adapted from script written by Chat GPT

#!/bin/bash

FILE_PATH=$1

# Get the container ID for the service
CONTAINER_ID=$(docker-compose -f docker-compose.dev.yml ps -q app)

# Copy the file to the container
docker cp $FILE_PATH $CONTAINER_ID:/app/samples/someinputfile.csv

# Execute the command inside the container
docker compose -f docker-compose.dev.yml exec app rm -f output.csv && node dist/index.js -F samples/someinputfile.csv -B 10

sleep 1

# Print the output
docker compose -f docker-compose.dev.yml exec app cat /app/output.csv