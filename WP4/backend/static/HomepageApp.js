import React from "react"


class HomepageApp extends React.component {
    aboutUs() {
        return (
            <div className="col-md-6">
                <h2>Over GLITCH</h2>
                <p>Het GLITCH-platform (Gamified Learning Interface Through Challenges and 
                    Heuristics) is een innovatief, thema-onafhankelijk leerplatform ontworpen om 
                    onderwijs op een dynamische en interactieve manier te benaderen. Het platform 
                    gebruikt een modulaire structuur om een breed scala aan vakken en cursussen te 
                    huisvesten, elk georganiseerd binnen specifieke domeinen om de navigatie en 
                    specialisatie voor gebruikers te vergemakkelijken.</p>
            </div>
        )
    }

    contact() {
        return (
            <div className="col-md-6">
                <h2>Contact</h2>
                <ul>
                    <li>Telefoon: 010 794 0000</li>
                    <li>Email: info@hogeschoolrotterdam.nl</li>
                    <li>Adres: Burgemeester S'jacobplein 1, 3015 CA Rotterdam</li>
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div>
                <AboutUs/>
                <Contact/>
            </div>
        )
    }
}

export default HomepageApp