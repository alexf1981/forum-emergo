const { React } = window;

const CityVisual = ({ rank, score }) => {
    let imageSrc = './assets/city_village.png';
    if (score >= 500) imageSrc = './assets/city_town.png';
    if (score >= 1000) imageSrc = './assets/city_capital.png';
    return (
        <div className="city-visual-container">
            <img src={imageSrc} alt={`Stad status: ${rank}`} className="city-image" />
            <div className="city-rank-badge">{rank}</div>
        </div>
    );
};
