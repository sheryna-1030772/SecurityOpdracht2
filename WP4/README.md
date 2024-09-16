# wp4-2024-starter
Template voor WP4 opdracht 2024 "GLITCH". Vul dit document aan zoals beschreven in eisen rondom opleveren (zie GLITCH-assignment.pdf)


# GLITCH

## Start GLITCH
Om GLITCH te starten moet je een aantal stappen volgen.

### Website
1. Open de Docker Desktop app en kom terug.
2. Open een terminal in hoofd repository
3. Type "docker compose up"
4. Scroll een klein beetje omhoog en klik op "http://localhost:8081" of ga naar de browser en voer dit adres in.
5. Klik op "Uitloggen" en registreer een account of login met een van de onderstaande accounts:
- Student: gebruikersnaam: 1030772, wachtwoord: 1030772
- Docent: gebruikersnaam: dirk, wachtwoord: dirk

### Mobile
1. Open een terminal
2. Run de command's die bij je OS horen:
- chmod +x ./ip_address.sh (alleen voor linux/mac)
- ./ip_address.sh (voor linux/mac) 
- python3 ip_address.py (voor Windows de enige command)
3. Split de terminal
4. Type in de linker terminal de volgende command's:
- cd frontend2
- npm install
- npx expo start
5. Type in de rechter terminal de volgende command's:
- pip install -r requirements.txt
- cd backend
- python main.py
6. In de linker terminal druk op "a" op je toetsenbord of scan de qr code met je telefoon (waar expo go app op is geÃ¯nstalleerd)
7. Doe hetzelfde als stap 5 van de website op mobile.


# Bronnenlijst
https://www.geeksforgeeks.org/how-to-redirect-to-another-page-in-reactjs/
https://stackoverflow.com/questions/64965273/react-interval-not-stopping-after-leaving
