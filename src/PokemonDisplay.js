import React from 'react'

export default function PokemonDisplay({ displayedPokemon, isPlayerPokemon })
{
    //Ensure that Pokemon data has fully loaded before displaying
    let loaded = false;
    displayedPokemon ? loaded=true : loaded=false
    if (loaded === false) {return <div className="loadingPlaceholder"> Loading Pokemon! </div>}       //asdfasdfasdf

    //The HP meter is a simple 0-100 percentage of the Pokemon's remaining HP
    let hpPercentage = 100 * (displayedPokemon.curHP / displayedPokemon.maxHP);

    if (isPlayerPokemon === false)
    {
        return (
        <div className="pokemonDisplay pokemonDisplay-opponent">
            <div className="pokemonDataDisplay pokemonDataDisplay-opponent">
                {displayedPokemon.pokemonName.toUpperCase()} <br /><br />
                HP:  {displayedPokemon.curHP} / {displayedPokemon.maxHP} <br />
                <meter className="hpMeter" value={hpPercentage} min="0" max="100" optimum="100" high="50" low="25"> </meter>
            </div>
            <div className="pokemonImage pokemonImage-opponent">
                <img src={displayedPokemon.sprite} width="250" height="250" />
            </div>
        </div>
        )
    }
    else //displaying opponent's Pokemon
    {
        return (
        <div className="pokemonDisplay pokemonDisplay-player">
            <div className="pokemonImage pokemonImage-player">
                <img src={displayedPokemon.sprite} width="250" height="250" />
            </div>
            <div className="pokemonDataDisplay pokemonDataDisplay-player">
                {displayedPokemon.pokemonName.toUpperCase()} <br /><br />
                HP:  {displayedPokemon.curHP} / {displayedPokemon.maxHP} <br />
                <meter className="hpMeter" value={hpPercentage} min="0" max="100" optimum="100" high="50" low="25"> </meter>
            </div>
        </div>
        )
    }
}
