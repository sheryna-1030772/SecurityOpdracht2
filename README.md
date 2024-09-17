# SecurityOpdracht2

## Opdracht
Kijk naar één van de werkplaatsen van vorig jaar en maak een verslag met:

1. Welke OWASP-Top 10 zijn van toepassing?
- Identification and Authentication Failures
    De secret keys in zijn hardcoded in de code, dus deze zijn niet veilig.
- Cryptographic Failures
    De secret keys in zijn hardcoded in de code, dus deze zijn niet veilig.
- Security Misconfiguration
    1. De debug mode staat aan wat gedetailleerde foutmeldingen kan blootstellen die informatie over de applicatie en serverconfiguratie kunnen onthullen.
    2. De CORS-configuratie staat verzoeken van alle origins toe, wat een onveilige configuratie is.

2. Welke code was stuk? (oude code)
    - Identification and Authentication Failures en Cryptographic Failures
        app.secret_key = 'this_is_a_secret_key'
        app.config['JWT_SECRET_KEY'] = 'this_is_a_jwt_secret_key'
    - Security Misconfiguration
        1. app.config['DEBUG'] = True
        2. CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

3. Wat is de nieuwe code? (nieuwe code + commit id)
    - Commit ID: 3d5d28c
    - Identification and Authentication Failures en Cryptographic Failures
        app.secret_key = os.getenv('SECRET_KEY', 'fallback_secret_key')
        app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback_jwt_secret_key')
    - Security Misconfiguration
        1. app.run(host='0.0.0.0', port=8000, debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true')
        2. CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ALLOWED_ORIGINS', '*').split(',')}}, supports_credentials=True)

4. Waarom zijn de overige OWASP-Top 10 items niet van toepassing?
    - Broken Access Control
        Gebruikers hebben rollen die hun rechten beperken, dus hebben ze toegang tot beperkte functies.
    - Injection
        Er wordt gebruikt gemaakt van parameterized queries, waardoor injecties voorkomen worden.
    - Insecure Design
        De code implementeerd beveiligingsmaatregelen, zoals gehashte wachtwoorden en geauthoriseerde toegang tot functies.
    - Vulnerable and Outdated Components
        De code gebruikt specifieke versies van libraries, waardoor de code niet geupdate hoeft te worden.
    - Software and Data Integrity Failures
        De code gebruikt een gehashte wachtwoord.
    - Security Logging and Monitoring Failures
        Belangrijke acties zoals inloggen en aanmelden worden gelogd d.m.v. json-messages.
    - Server-Side Request Forgery
        De code doet geen externe URL's aanroepen.



## Bron
https://owasp.org/www-project-top-ten/