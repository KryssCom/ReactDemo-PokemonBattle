import React from 'react'

export default function PokemonDisplay({ displayedPokemon })
{
    //First, ensure that pokemon data has fully loaded
    let loaded = false;
    displayedPokemon ? loaded=true : loaded=false
    if (loaded === false) {return "Loading Pokemon...";}



    //console.log("displayed pkmn: ", displayedPokemon.pokemonName);



    return (
    <div>
        <img src={displayedPokemon.sprite} width="100" height="100" /> <br />
        Pokemon:  {displayedPokemon.pokemonName} <br />
        HP:  {displayedPokemon.curHP} / {displayedPokemon.maxHP}
    </div>
    )
}
