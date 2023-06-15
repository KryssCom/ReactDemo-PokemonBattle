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
    const [playerPokemonSelected, setPlayerPokemonSelected] = useState(false);


    const [opponentPokemon, setOpponentPokemon] = useState();
    const [playerPokemon, setPlayerPokemon] = useState();
    const [gameIsOver, setGameIsOver] = useState(false);


    const [currentTurn, setCurrentTurn] = useState("neutral");      //Options:  "neutral", "player", "opponent";  swap for Enum?
    const opponentTurnInProgress = useRef(false);
    const playerTurnInProgress = useRef(false);


    const move = 
    {
        moveName: "",
        moveType: "",
        movePower: 0
    };


    class Pokemon
    {
        constructor(name, url, typeOne, weaknesses, resistances, maxHP, curHP, sprite, moves)
        {
            this.pokemonName = name; 
            this.pokemonUrl = url;
            this.typeOne = typeOne;
            this.typeTwo = "";
            this.weaknesses = weaknesses;
            this.resistances = resistances
            this.maxHP = maxHP;
            this.curHP = curHP; 
            this.sprite = sprite;
            this.moves = moves;       //array of 4 moves, each move is an object
        }
    }
 





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

        async function InitialPageLoad(callbackSinglePkmnRetrieval)
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

            callbackSinglePkmnRetrieval(randomOpponentPokemon)
                .then(result => {
                    setOpponentPokemon(result);
                })

            return;
        }


        setLoadingApiData(false);
        InitialPageLoad(RetrieveDataForSinglePokemon);
        setLoadingApiData(false);

        return; // () => cancel()
    }, [])






    
    useEffect(() => {

        async function OpponentTurn(callbackResolveAtk, callbackPrintTerminalMsg)
        {
            console.log("OPPONENT NOW TAKING TURN; datetime: ", Date.now() );

            //setPlayerTerminalMsg("It's your opponent's turn!");
            //await new Promise(r => setTimeout(r, 2000));
            await callbackPrintTerminalMsg("It's your opponent's turn!");



            let attackNumber = Math.floor(Math.random() * 4);
            let attackResult = await callbackResolveAtk(opponentPokemon, playerPokemon, attackNumber);


            if (attackResult == "endgame")
            {
                setCurrentTurn("neutral");
                callbackPrintTerminalMsg(playerPokemon.pokemonName.toUpperCase() + " fainted! You lose!");
                setGameIsOver(true);
                return;
            }
            else if (attackResult == "continue")
            {
                callbackPrintTerminalMsg("It's your turn!");
                opponentTurnInProgress.current = false;
                setCurrentTurn("player");
                return;
            }
        }




        if ((currentTurn == "opponent") && (opponentTurnInProgress.current == false))
        {
            opponentTurnInProgress.current = true;
            OpponentTurn(ResolveAttack, PrintNewTerminalMsg);
        }

        return; // () => cancel()
    }, [currentTurn])







    async function RetrieveDataForSinglePokemon(pokemonArg)
    {
        const singlePokemonRequest = await axios.get(pokemonArg.url); //cancellation crap here
        let dataFromSinglePokemon = (singlePokemonRequest.data);
        console.log("Raw Pokemon Data: ", dataFromSinglePokemon);

        //Grabbing four random moves for this Pokemon
        let listOfPokemonMoveUrls = dataFromSinglePokemon.moves.map(m => m.move.url);
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


        //Grabbing type data
        let typeDataUrl = dataFromSinglePokemon.types[0].type.url;
        let typeDataRequest = await axios.get(typeDataUrl) //cancellation crap here
        let retrievedWeaknesses = [];
        let retrievedResistances = [];
        console.log("Raw Type Data: ", typeDataRequest.data.damage_relations);

        for (let i = 0; i < typeDataRequest.data.damage_relations.double_damage_from.length; i++)
        {
            retrievedWeaknesses.push(typeDataRequest.data.damage_relations.double_damage_from[i].name)
        }

        for (let i = 0; i < typeDataRequest.data.damage_relations.half_damage_from.length; i++)
        {
            retrievedResistances.push(typeDataRequest.data.damage_relations.half_damage_from[i].name)
        }

        for (let i = 0; i < typeDataRequest.data.damage_relations.no_damage_from.length; i++)
        {
            retrievedResistances.push(typeDataRequest.data.damage_relations.no_damage_from[i].name)
        }



        let retrievedPokemon = new Pokemon(
            dataFromSinglePokemon.name,
            pokemonArg.url,
            dataFromSinglePokemon.types[0].type.name,
            //dataFromSinglePokemon.types[1].type.name,
            retrievedWeaknesses,
            retrievedResistances,
            dataFromSinglePokemon.base_experience,
            dataFromSinglePokemon.base_experience,
            dataFromSinglePokemon.sprites.front_default,
            retrievedPokemonMoves
        );

        console.log("Retrieved Pokemon: ", retrievedPokemon);


        return retrievedPokemon;
    }









    //CC_NOTE: should this use a "ResolveAttack" function?
    async function ActivateAttackBtn(attackNumber) 
    {
        if ((currentTurn == "opponent") || (playerTurnInProgress.current == true)) return;
        playerTurnInProgress.current = true;

        //Look up the move, look up that move's power, subtract that power from opponent's remaining HP
        attackNumber--;
        let attackResult = await ResolveAttack(playerPokemon, opponentPokemon, attackNumber);


        if (attackResult == "endgame")
        {
            setCurrentTurn("neutral");
            await PrintNewTerminalMsg(opponentPokemon.pokemonName.toUpperCase() + " fainted! You win!");
            setGameIsOver(true);
            return;
        }
        else if (attackResult == "continue")
        {
            playerTurnInProgress.current = false;
            setCurrentTurn("opponent");
            return;
        }

    }







    async function ResolveAttack(attackingPokemon, defendingPokemon, attackSelectionNum) 
    {
        let chosenAttackPower = attackingPokemon.moves[attackSelectionNum].movePower / 2; 
        let chosenAttackType = attackingPokemon.moves[attackSelectionNum].moveType;
        let weaknessConfirmed = false;
        let resistanceConfirmed = false;

        



        //Check for weakness and resistance, double or halve atk power
        if (defendingPokemon.weaknesses.includes(chosenAttackType))
        {
            weaknessConfirmed = true;
            chosenAttackPower = chosenAttackPower * 2;
        }
        else if (defendingPokemon.resistances.includes(chosenAttackType))
        {
            resistanceConfirmed = true;
            chosenAttackPower = chosenAttackPower / 2;
        }


        chosenAttackPower = Math.round(chosenAttackPower);
        console.log("atk power (modified): " + chosenAttackPower);

        await PrintNewTerminalMsg(attackingPokemon.pokemonName.toUpperCase() + " used " + attackingPokemon.moves[attackSelectionNum].moveName.toUpperCase() + "!");

        let defendingPokemonRemainingHP = defendingPokemon.curHP;
        defendingPokemonRemainingHP = defendingPokemonRemainingHP - chosenAttackPower;

        if (defendingPokemonRemainingHP < 0) {defendingPokemonRemainingHP = 0;}

        if (weaknessConfirmed)
            {await PrintNewTerminalMsg("It's super effective!");}
        else if (resistanceConfirmed)
            {await PrintNewTerminalMsg("It's not very effective...");}


        if (currentTurn == "opponent")
            {setPlayerPokemon( {...playerPokemon, curHP: defendingPokemonRemainingHP});}
        else if (currentTurn == "player")
            {setOpponentPokemon( {...opponentPokemon, curHP: defendingPokemonRemainingHP});}


        if (defendingPokemonRemainingHP > 0)
            {return "continue";}
        else
            {return "endgame"};
    }








    async function ActivatePokemonSelectionBtn(playerSelectedPokemon) 
    {
        //console.log("NOW IN POKEMON SELECT BTN; playerSelectedPokemon: ", playerSelectedPokemon);

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
            })

        setPlayerPokemonSelected(true);
        await PrintNewTerminalMsg("It's your turn!");
        setCurrentTurn("player");
    }

    async function ActivateMoveRefreshBtn() 
    {
        if ((currentTurn == "opponent") || (playerTurnInProgress.current == true)) return;
        playerTurnInProgress.current = true;

        await PrintNewTerminalMsg("Refreshing your Pokemon's attacks....");

        const singlePokemonRequest = await axios.get(playerPokemon.pokemonUrl); //cancellation crap here
        let dataFromSinglePokemon = (singlePokemonRequest.data);

        let listOfPokemonMoveUrls = dataFromSinglePokemon.moves.map(m => m.move.url);
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

        let modifiedPlayerPokemon = playerPokemon; 
        modifiedPlayerPokemon.moves = retrievedPokemonMoves;

        setPlayerPokemon(modifiedPlayerPokemon);

        playerTurnInProgress.current = false;
        setCurrentTurn("opponent");
        return;

    }




    function RefreshPage() 
    {
        window.location.reload(false);
    }
        
    async function PrintNewTerminalMsg(msg) 
    {
        setPlayerTerminalMsg(msg);
        await new Promise(r => setTimeout(r, 1200));
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
            <br />
            <br />
            <br />
            You:
            <PokemonDisplay displayedPokemon={playerPokemon} />
            <br />
            <br />
            <ActionButtons 
                    ActivateAttackBtn={ActivateAttackBtn}            //Pass the function for attacking
                    ActivateMoveRefreshBtn={ActivateMoveRefreshBtn}  //Pass the function for move-refresh
                    playersPokemon={playerPokemon}                   //Pass the player's pokemon, so its attacks can be displayed
                    />
            <br />
            <hr />
            <hr />
            <PlayerTerminal playerTerminalMsg={playerTerminalMsg} />
            <br />
            <br />
            <hr />
            <hr />
            {gameIsOver && <button onClick={RefreshPage}> Play Again! </button>}
        </>
        );
    }
}

export default App;

