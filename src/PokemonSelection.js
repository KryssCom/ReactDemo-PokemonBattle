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
        label: v.name,
        value: v.name,
    }));

    pokemonOptions.unshift({label: undefined, value: undefined})


    return (
        <div>
            <label>
            Select your Pokemon: <br />

            <select value={value} onChange={handleChange}>
                {pokemonOptions.map((option) => (
                <option key={option.value} value={option.value}> {option.label} </option>
                ))}
            </select>

            </label>
            <br />
            <br />
            {value && <button onClick={() => ActivatePokemonSelectionBtn(value)}> I choose you, {value}! </button>}
        </div>
    );
}




