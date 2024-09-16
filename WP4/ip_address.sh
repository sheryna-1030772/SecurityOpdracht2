# retrieve IP-address
ip_address=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)

# set EXPO_PUBLIC_BACKEND_URL in config.env file
echo "EXPO_PUBLIC_BACKEND_URL=http://$ip_address:8000" > frontend2/.env
echo "DOCKER_ID=$ip_address" >> frontend2/.env