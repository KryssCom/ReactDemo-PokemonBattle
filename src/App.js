import axios from 'axios'
import React, { useState, useEffect, useRef} from 'react';
import PokemonDisplay from './PokemonDisplay'
import PokemonSelection from './PokemonSelection'
import ActionButton from './ActionButton';
import PlayerTerminal from './PlayerTerminal';



function App() {

    //TestChange1

    const NumberOfMoves = 4;

    const [currentPageUrl, setCurrentPageUrl] = useState("https://pokeapi.co/api/v2/pokemon")
    const [loadingApiData, setLoadingApiData] = useState(true)
    const [fullPokemonList, setFullPokemonList] = useState([]);
    const [playerTerminalMsg, setPlayerTerminalMsg] = useState("It's your turn!");
    const [actionButtonText, setActionButtonText] = useState("ATTACK!");
    const [playerPokemonSelected, setPlayerPokemonSelected] = useState(false);


    const [opponentPokemon, setOpponentPokemon] = useState();
    const [playerPokemon, setPlayerPokemon] = useState();


    const move = 
    {
        moveName: "",
        moveType: "",
        movePower: 0
    };

 
    const [pokemon, setPokemon] = useState(
    {
        pokemonName: "",
        typeOne: "",
        typeTwo: "",
        maximumHP: 0,
        currentHP: 0,
        moves: [{}, {}, {}, {}]           //array of 4 moves, each move is an object
    
    })




    //THIS IS THE ORIGINAL CODE, DO NOT CHANGE IT
    //useEffect(() => {
    //    setLoading(true)
    //    let cancel
    //    axios.get(currentPageUrl, {
    //        cancelToken: new axios.CancelToken(c => cancel = c)
    //    }).then(res => {
    //        setLoading(false)
    //        setNextPageUrl(res.data.next)
    //        setPrevPageUrl(res.data.previous)
    //        setPokemon(res.data.results.map(p => p.name))
    //    })
    //    return () => cancel()
    //}, [currentPageUrl])








    useEffect(() => {

        async function InitialPageLoad(callback)
        {
            let batchOfIncomingPokemon = [];
            let cancel;
            let nextPageToCall = currentPageUrl;


            //First, use the PokeAPI to generate a list of objects containing a name and a URL for each of the original 151 Pokemon
            while (fullPokemonList.length < 151)
            {
                const fullListRequest = await axios.get(nextPageToCall) //, { cancelToken: new axios.CancelToken(c => cancel = c) })
                batchOfIncomingPokemon = (fullListRequest.data.results);
                nextPageToCall = fullListRequest.data.next;
                fullPokemonList.push(...batchOfIncomingPokemon);

                if (fullPokemonList.length > 151)
                {
                    fullPokemonList.splice(151);
                }
            }


            console.log("full pkmn list: ", fullPokemonList);


            let randomOpponentPokemon = fullPokemonList[Math.floor(Math.random() * fullPokemonList.length)];

            callback(randomOpponentPokemon)
                .then(result => {
                    setOpponentPokemon(result)
                    console.log("retrievedOpponent: ", result);
                })



            return;
        }





        setLoadingApiData(true);

        InitialPageLoad(RetrieveDataForSinglePokemon);

        setLoadingApiData(false);

        return; // () => cancel()
    }, [])













    async function RetrieveDataForSinglePokemon(pokemonArg)
    {
        console.log("NOW IN RetrieveDataForSinglePokemon");

        const singlePokemonRequest = await axios.get(pokemonArg.url); //cancellation crap here
        let dataFromSingleRandomPokemon = (singlePokemonRequest.data);

        let listOfPokemonMoveUrls = dataFromSingleRandomPokemon.moves.map(m => m.move.url);
        let retrievedPokemonMoves = [{}, {}, {}, {}];

        for (let i = 0; i < NumberOfMoves; i++)
        {
            const randomMoveUrlForPkmn = listOfPokemonMoveUrls[Math.floor(Math.random() * listOfPokemonMoveUrls.length)];
            const moveRequest = await axios.get(randomMoveUrlForPkmn) //cancellation crap here
            let dataFromThisRandomMove = (moveRequest.data);
            retrievedPokemonMoves[i].moveName = dataFromThisRandomMove.name;
            retrievedPokemonMoves[i].moveType = dataFromThisRandomMove.type.name;
            retrievedPokemonMoves[i].movePower = dataFromThisRandomMove.power ?? 10;
        }

        let retrievedPokemon = 
        {
            pokemonName: dataFromSingleRandomPokemon.name,
            typeOne: dataFromSingleRandomPokemon.types[0].type.name,
            //typeTwo: dataFromSingleRandomPokemon.types[1].type.name,
            maximumHP: dataFromSingleRandomPokemon.base_experience,
            currentHP: dataFromSingleRandomPokemon.base_experience,
            moves: retrievedPokemonMoves
        }

        return retrievedPokemon;
    }










    function ActivateActionButton() 
    {
      setPlayerTerminalMsg("It's Super Effective!");
    }


    function ActivatePokemonSelectionBtn(playerSelectedPokemon) 
    {
      console.log("NOW IN POKEMON SELECT BTN; playerSelectedPokemon: ", playerSelectedPokemon);

      let selectedPokemon = {};

      for (let i = 0; i < fullPokemonList.length; i++)
      {
          if (fullPokemonList[i].name == playerSelectedPokemon)
          {
              selectedPokemon = fullPokemonList[i];
              break;
          }
      }



        RetrieveDataForSinglePokemon(selectedPokemon)
            .then(result => {
            setPlayerPokemon(result);
            console.log("retrievedPlayerPokemon: ", result);
            })




        setPlayerPokemonSelected(true);
    }









    if (loadingApiData) //LOADING SCREEN
    {
        return "Loading..."
    }
    else if (playerPokemonSelected === false) //POKEMON SELECTION SCREEN
    {
        return (
        <>
            <br />
            Opponent:
            <PokemonDisplay displayedPokemon={opponentPokemon} />
            <br />
            <br />
            <PokemonSelection ActivatePokemonSelectionBtn={ActivatePokemonSelectionBtn} playerPokemonList={fullPokemonList} />
            <br />
        </>
        );
    }
    else    //MAIN SCREEN
    {
        return(
        <>
            <br />
            Opponent:
            <PokemonDisplay displayedPokemon={opponentPokemon} />
            <br />
            You:
            <PokemonDisplay displayedPokemon={playerPokemon} />
            <br />
            <br />
            <ActionButton ActivateActionButton={ActivateActionButton} actionButtonText={actionButtonText} />
            <br />
            <PlayerTerminal playerTerminalMsg={playerTerminalMsg} />
            <br />
            <br />
            <hr />
        </>
        );
    }
}

export default App;

