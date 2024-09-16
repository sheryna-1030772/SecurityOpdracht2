import os
import re
import subprocess
import platform

def get_ip_address():
    system = platform.system()
    ip_address = None

    if system == "Windows":
        # Execute the `ipconfig` command and get the output
        ipconfig_output = subprocess.check_output("ipconfig", shell=True).decode()
        
        # Use regex to find the IP addresses in the output
        ip_addresses = re.findall(r'IPv4 Address[ .]*: ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)', ipconfig_output)
    else:
        # Execute the `ifconfig` command and get the output
        ifconfig_output = subprocess.check_output("ifconfig", shell=True).decode()
        
        # Use regex to find the IP addresses in the output
        ip_addresses = re.findall(r'inet (addr:)?([0-9]*\.){3}[0-9]*', ifconfig_output)
        ip_addresses = [match[1] for match in ip_addresses]

    # Filter out the loopback address and extract the actual IP address
    for ip in ip_addresses:
        if ip != '127.0.0.1':
            ip_address = ip
            break
    
    return ip_address

def set_backend_url(ip_address):
    backend_url = f"http://{ip_address}:8000"
    env_content = f"EXPO_PUBLIC_BACKEND_URL={backend_url}"

    env_dir = 'frontend2'
    os.makedirs(env_dir, exist_ok=True)
    
    # Write the URL to the .env file
    env_file_path = os.path.join(env_dir, '.env')
    with open(env_file_path, 'w') as env_file:
        env_file.write(env_content)

def add_to_gitignore():
    gitignore_path = '.gitignore'
    
    # Read the existing content of .gitignore
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r') as gitignore_file:
            gitignore_content = gitignore_file.read()
    else:
        gitignore_content = ""
    
    # Add .env to .gitignore if it's not already there
    if '.env' not in gitignore_content.splitlines():
        with open(gitignore_path, 'a') as gitignore_file:
            gitignore_file.write("\n.env\n")

if __name__ == "__main__":
    ip_address = get_ip_address()
    if ip_address:
        set_backend_url(ip_address)
        add_to_gitignore()
    else:
        print("No IP address found.")
