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
    const [playerTerminalMsg, setPlayerTerminalMsg] = useState("");
    const [attackBtnText, setAttackBtnText] = useState(["", "", "", ""]);
    const [playerPokemonSelected, setPlayerPokemonSelected] = useState(false);


    const [opponentPokemon, setOpponentPokemon] = useState();
    const [playerPokemon, setPlayerPokemon] = useState();



    const [currentTurn, setCurrentTurn] = useState("neutral");      //Options:  "neutral", "player", "opponent";  swap for Enum?
    const opponentTurnInProgress = useRef(false);




    const move = 
    {
        moveName: "",
        moveType: "",
        movePower: 0
    };

 
    const pokemon =
    {
        pokemonName: "",
        typeOne: "",
        typeTwo: "",
        maximumHP: 0,
        currentHP: 0,
        moves: [{}, {}, {}, {}]           //array of 4 moves, each move is an object
    
    };




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
            console.log("OPPONENT NOW TAKING TURN; datetime: ", Date.now() );

            setPlayerTerminalMsg("It's your opponent's turn!");

            await new Promise(r => setTimeout(r, 1000));


            //ATTACK SELECTION AND RESOLUTION
            //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

            let attackNumber = Math.floor(Math.random() * 4);

            console.log("random attack: " + attackNumber);


            console.log("Opponent Attack Chosen: " + opponentPokemon.moves[attackNumber].moveName);
            let chosenMovePower = opponentPokemon.moves[attackNumber].movePower;
            let playerPokemonRemainingHP = playerPokemon.currentHP;
            playerPokemonRemainingHP = playerPokemonRemainingHP - chosenMovePower;

            console.log("player remaining hp: " + playerPokemonRemainingHP + "   move pwr: " + chosenMovePower);

            if (playerPokemonRemainingHP <= 0)
            {
                setCurrentTurn("neutral");
                setPlayerTerminalMsg(playerPokemon.pokemonName + " fainted! You lose!");
                return;
            }
            else
            {
                setPlayerPokemon( {...playerPokemon, currentHP: playerPokemonRemainingHP});
            }

            //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

            
            console.log("!!!!opponent remianing hp: " + opponentPokemon.currentHP);

            setPlayerTerminalMsg("It's your turn!");
            opponentTurnInProgress.current = false;
            setCurrentTurn("player");
            return;
        }




        if ((currentTurn == "opponent") && (opponentTurnInProgress.current == false))
        {
            opponentTurnInProgress.current = true;
            OpponentTurn();
        }

        return; // () => cancel()
    }, [currentTurn])







    async function RetrieveDataForSinglePokemon(pokemonArg)
    {
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









    //CC_NOTE: should this use a "ResolveAttack" function?
    function ActivateAttackBtn(attackNumber) 
    {
        //Look up the move, look up that move's power, subtract that power from opponent's remaining HP
        attackNumber--;
        console.log("Attack Chosen: " + playerPokemon.moves[attackNumber].moveName);
        let chosenMovePower = playerPokemon.moves[attackNumber].movePower;
        let opponentPokemonRemainingHP = opponentPokemon.currentHP;
        opponentPokemonRemainingHP = opponentPokemonRemainingHP - chosenMovePower;



        //console.log("Opponent Remaining HP: " + opponentPokemonRemainingHP);


        if (opponentPokemonRemainingHP <= 0)
        {
            setCurrentTurn("neutral");
            setPlayerTerminalMsg(opponentPokemon.pokemonName + " fainted! You win!");
        }
        else
        {
            setOpponentPokemon( {...opponentPokemon, currentHP: opponentPokemonRemainingHP});
            setCurrentTurn("opponent");
        }
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
        setPlayerTerminalMsg("It's your turn!");
        setCurrentTurn("player");
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
            <hr />
            <hr />
            <PlayerTerminal playerTerminalMsg={playerTerminalMsg} />
            <br />
            <br />
            <hr />
            <hr />
        </>
        );
    }
}

export default App;

