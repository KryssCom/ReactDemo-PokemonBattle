import React from 'react'
import PokemonImage from './PokemonImage'

export default function PokemonDisplay({ displayedPokemon, isPlayerPokemon, pokemonAnimation })
{
    //Ensure that Pokemon data has fully loaded before displaying
    let loaded = false;
    displayedPokemon ? loaded=true : loaded=false
    if (loaded === false) {return <div className="loadingPlaceholder"> Loading Pokemon! </div>} 

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
            <div className="pokemonImage-opponent">
                <PokemonImage displayedPokemon={displayedPokemon} animationStatus={pokemonAnimation} />
            </div>
        </div>
        )
    }
    else //displaying opponent's Pokemon
    {
        return (
        <div className="pokemonDisplay pokemonDisplay-player">
            <div className="pokemonImage-player">
                <PokemonImage displayedPokemon={displayedPokemon} animationStatus={pokemonAnimation} />
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
