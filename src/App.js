import axios from 'axios'
import React, { useState, useEffect, useRef} from 'react';
import PokemonDisplay from './PokemonDisplay'
import PokemonSelection from './PokemonSelection'
import ActionButtons from './ActionButtons';
import PlayerTerminal from './PlayerTerminal';



function App() 
{

    const NumberOfMoves = 4;

    const [currentPageUrl, setCurrentPageUrl] = useState("https://pokeapi.co/api/v2/pokemon")
    const [loadingApiData, setLoadingApiData] = useState(true)
    const [fullPokemonList, setFullPokemonList] = useState([]);
    const [playerTerminalMsg, setPlayerTerminalMsg] = useState("It's your turn!");
    const [attackBtnText, setAttackBtnText] = useState(["", "", "", ""]);
    const [playerPokemonSelected, setPlayerPokemonSelected] = useState(false);


    const [opponentPokemon, setOpponentPokemon] = useState();
    const [playerPokemon, setPlayerPokemon] = useState();
    const [currentTurn, setCurrentTurn] = useState("neutral");


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






    
    useEffect(() => {

        async function OpponentTurn()
        {
            console.log("OPPONENT NOW TAKING TURN");

            //OPPONENT STUFF HERE

            setCurrentTurn("player");
            return;
        }


        if (currentTurn == "opponent");
        {
            OpponentTurn();
        }

        return; // () => cancel()
    }, [currentTurn])







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










    function ActivateAttackBtn(attackNumber) 
    {
        console.log("NOW IN ACTIVATE ATTACK BTN; NUM: " + attackNumber + " type:", typeof(attackNumber));

        switch (attackNumber)
        {
            case 1:
                setPlayerTerminalMsg("It's Super Effective! 1111");
                break;
            case 2:
                setPlayerTerminalMsg("It's Super Effective! 2222");
                break;
            case 3:
                setPlayerTerminalMsg("It's Super Effective! 3333");
                break;
            case 4:
                setPlayerTerminalMsg("It's Super Effective! 4444");
                break;
            default: 
                setPlayerTerminalMsg("ATTACK ERROR :( ");
                break;
        }





        //look up the move
        //look up the power
        //subtract the power from opponent hp
        //player msg feedback
        //check for faint
        //set opponent turn     a useEffect that waits for opponent turn true?


       setCurrentTurn("opponent");

    }






    function ActivateMoveRefreshBtn(attackNumber) 
    {
        setPlayerTerminalMsg("REFRESHING MOVES! ");
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
            let tempMoveArray = [result.moves[0].moveName, result.moves[1].moveName, result.moves[2].moveName, result.moves[3].moveName];
            setAttackBtnText([...tempMoveArray]);
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
            <ActionButtons 
                    ActivateAttackBtn={ActivateAttackBtn}            //Pass the function for attacking
                    ActivateMoveRefreshBtn={ActivateMoveRefreshBtn}  //Pass the function for move-refresh
                    attackBtnText={attackBtnText}                    //Array of four strings, the names of the four attacks
                    />
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

