import React from 'react'

export default function PokemonDisplay({ displayedPokemon, isPlayerPokemon })
{
    //First, ensure that pokemon data has fully loaded
    let loaded = false;
    displayedPokemon ? loaded=true : loaded=false
    if (loaded === false) {return "Loading Pokemon...";}



    if (isPlayerPokemon === false)
    {
        console.log("IPP FALSE");
        return (
        <div className="pokemonDisplay pokemonDisplay-opponent">
            <div className="pokemonDataDisplay pokemonDataDisplay-opponent">
                {displayedPokemon.pokemonName.toUpperCase()} <br /><br />
                HP:  {displayedPokemon.curHP} / {displayedPokemon.maxHP}            
            </div>
            <div className="pokemonImage pokemonImage-opponent">
                <img src={displayedPokemon.sprite} width="250" height="250" />
            </div>
        </div>
        )
    }
    else
    {
        console.log("IPP TRUE");
        return (
        <div className="pokemonDisplay pokemonDisplay-player">
            <div className="pokemonImage pokemonImage-player">
                <img src={displayedPokemon.sprite} width="250" height="250" />
            </div>
            <div className="pokemonDataDisplay pokemonDataDisplay-player">
                {displayedPokemon.pokemonName.toUpperCase()} <br /><br />
                HP:  {displayedPokemon.curHP} / {displayedPokemon.maxHP}            
            </div>
        </div>
        )
    }
}
