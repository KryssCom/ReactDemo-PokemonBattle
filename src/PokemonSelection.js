import React, { useState, useEffect, useRef} from 'react';


export default function PokemonPlayer({ ActivatePokemonSelectionBtn, playerPokemonList })
{
    const [value, setValue] = React.useState();

    //First, ensure that pokemon data has fully loaded
    let loaded = false;
    playerPokemonList ? loaded=true : loaded=false
    if (loaded === false) {return "Loading Pokemon...";}


    //console.log("playerPokemonList: ", playerPokemonList);


    function handleChange(event)
    {
        setValue(event.target.value);
    };



    const pokemonOptions = playerPokemonList.map(v => ({
        key: v.url,
        label: v.name.toUpperCase(),
        value: v.name,
    }));

    pokemonOptions.unshift({key: 0, label: undefined, value: undefined})


    return (
        <div className="pokemonSelector">
            
            Select your Pokemon: 
            <br />
            <br />
            <br />

            <select className="pokemonSelectionDropdown" value={value} onChange={handleChange}>
                {pokemonOptions.map((option) => (
                <option key={option.key} value={option.value}> {option.label} </option>
                ))}
            </select> 

            {value && <button className="pokemonSelectionBtn" onClick={() => ActivatePokemonSelectionBtn(value)}> I choose you, {value.toUpperCase()}! </button>}
        </div>
    );
}


