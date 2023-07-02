import React, { useState, useEffect, useRef} from 'react';


export default function PokemonPlayer({ ActivatePokemonSelectionBtn, playerPokemonList })
{
    const [value, setValue] = React.useState();

    //Ensure that Pokemon data has fully loaded before displaying
    let loaded = false;
    playerPokemonList ? loaded=true : loaded=false
    if (loaded === false) {return "Loading Pokemon...";}


    //Ensure the value of the Pokemon dropdown is updated according to player selection
    function handleChange(event)
    {
        setValue(event.target.value);
    };


    //Generate a list of Pokemon usable for the selection dropdown
    let pokemonOptions = playerPokemonList.map(v => ({
        key: v.url,
        label: v.name.toUpperCase(),
        value: v.name,
    }));

    //Create an undefined "blank" in the first index of the dropdown, so that nothing is selected by default
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


