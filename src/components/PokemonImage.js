import React from 'react'

export default function PokemonImage({ displayedPokemon, animationStatus })
{

    console.log("animationStatus: " + animationStatus);



    if (animationStatus === "attacking")
    {
        return (
            <div className="pokemonAttackAnimation">
                <img src={displayedPokemon.sprite} width="250" height="250" />
            </div>
        )
    }
    else if (animationStatus === "receivingDmg")
    {
        return (
            <div className="pokemonDamagedAnimation">
                <img src={displayedPokemon.sprite} width="250" height="250" />
            </div>
        )
    }
    else 
    {
        return (
            <div className="pokemonImage">
                <img src={displayedPokemon.sprite} width="250" height="250" />
            </div>
        )
    }




}
