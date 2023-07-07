import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios'
import './styles.css';
import './fonts/PokemonGb-RAeo.ttf';
import PokemonDisplay from './components/PokemonDisplay';
import PokemonSelection from './components/PokemonSelection';
import ActionButtons from './components/ActionButtons';
import PlayerTerminal from './components/PlayerTerminal';


function App() 
{
    const InitialApiUrl = "https://pokeapi.co/api/v2/pokemon";
    const NumberOfMoves = 4;

    const [loadingApiData, setLoadingApiData] = useState(true)
    const [fullPokemonList, setFullPokemonList] = useState([]);
    const [playerTerminalMsg, setPlayerTerminalMsg] = useState("");
    const [playerPokemonSelected, setPlayerPokemonSelected] = useState(false);
    const [mostRecentlyRetrievedListOfMoveUrls, setMostRecentlyRetrievedListOfMoveUrls] = useState([]);

    const [opponentPokemon, setOpponentPokemon] = useState();
    const [playerPokemon, setPlayerPokemon] = useState();
    const [gameIsOver, setGameIsOver] = useState(false);

    const [currentTurn, setCurrentTurn] = useState("neutral");      //Options:  "neutral", "player", "opponent";  //Possible todo: swap for Enum?
    const opponentTurnInProgress = useRef(false);
    const playerTurnInProgress = useRef(false);

    const [playerPokemonAnimation, setPlayerPokemonAnimation] = useState("neutral");
    const [opponentPokemonAnimation, setOpponentPokemonAnimation] = useState("neutral");


    class PokemonMove
    {
        constructor(name, type, power)
        {
            this.moveName = name; 
            this.moveType = type;
            this.movePower = power;
        }
    }

    class Pokemon
    {
        constructor(name, url, typeOne, weaknesses, resistances, maxHP, curHP, sprite, moves, animation)
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
            this.moves = moves;       //Array of 4 PokemonMove objects
        }
    }
 


    //UseEffect for initial page load
    useEffect(() => {

        async function InitialPageLoad(callbackSinglePkmnRetrieval)
        {
            let nextPageToCall = InitialApiUrl;
            let batchOfIncomingPokemon = [];
            let newFullPokemonList = [];
            let cachedData = localStorage.getItem('initialPokeApiData');

            //First check to see if there is cached data from the Pokemon API; if so, use that to generate FullPokemonList
            if (cachedData) 
            {
                console.log("Using cached Pokemon data");
                newFullPokemonList = [...fullPokemonList, ...JSON.parse(cachedData)];
                setFullPokemonList(newFullPokemonList);
            } 
            else 
            {
                //If not already cached, use the Pokemon API to generate a list of objects containing a name and a URL for each of the original 151 Pokemon
                while (newFullPokemonList.length < 151)
                {
                    const fullListRequest = await axios.get(nextPageToCall);    //Possible todo: cancel via abortController
                    batchOfIncomingPokemon = (fullListRequest.data.results);    //The API limits calls to 20 Pokemon at a time
                    nextPageToCall = fullListRequest.data.next;                 //Assign the URL for the *next* batch of 20 Pokemon
                    newFullPokemonList = [...newFullPokemonList, ...batchOfIncomingPokemon];    //Add the incoming 20 to the list that has been pulled in thus far

                    if (newFullPokemonList.length > 151)    //Because we fetch in batches of 20, cut off anything above the 151 that we want
                    {
                        newFullPokemonList.splice(151);
                    }

                }

                //Set the primary list we need equal to the list we've created, and save that list in the browser's local storage
                setFullPokemonList(newFullPokemonList);             
                console.log("Saving new Pokemon data into cache");
                localStorage.setItem('initialPokeApiData', JSON.stringify(newFullPokemonList));

            }

            console.log("Full Pokemon List: \n", newFullPokemonList);

            //After we have our primary list of 151 Pokemon, select one randomly to be the opponent
            let randomOpponentPokemon = newFullPokemonList[Math.floor(Math.random() * newFullPokemonList.length)];

            //Use a callback to retrieve the rest of the data about the opponent, and then set the opponent Pokemon in state
            callbackSinglePkmnRetrieval(randomOpponentPokemon)
                .then(result => {
                    setOpponentPokemon(result);
                })

            return;
        }

        setLoadingApiData(false);
        InitialPageLoad(RetrieveDataForSinglePokemon);
        setLoadingApiData(false);

        return;

    //The warnings about dependencies are not relevant in this instance
    //eslint-disable-next-line react-hooks/exhaustive-deps     
    }, [])






    //UseEffect for opponent's turn
    useEffect(() => {

        async function OpponentTurn(callbackResolveAtk, callbackPrintTerminalMsg)
        {
            await callbackPrintTerminalMsg("It's your opponent's turn!");

            //Randomly select one of the opponent's four attacks, and resolve that attack
            let attackNumber = Math.floor(Math.random() * 4) + 1; //Random number from 1-4
            let attackResult = await callbackResolveAtk(opponentPokemon, playerPokemon, attackNumber);

            //Check for endgame state after opponent attack, otherwise continue with player's turn
            //Possible todo: move this to a separate function, since it's also checked after the player's turn
            if (attackResult === "endgame")
            {
                setCurrentTurn("neutral");
                callbackPrintTerminalMsg(playerPokemon.pokemonName.toUpperCase() + " fainted! You lose!");
                setGameIsOver(true);
                return;
            }
            else if (attackResult === "continue")
            {
                callbackPrintTerminalMsg("It's your turn!");
                opponentTurnInProgress.current = false;
                setCurrentTurn("player");
                return;
            }
        }

        if ((currentTurn === "opponent") && (opponentTurnInProgress.current === false))
        {
            opponentTurnInProgress.current = true;
            OpponentTurn(ResolveAttack, PrintNewTerminalMsg);
        }

        return;

    //The warnings about dependencies are not relevant in this instance
    //eslint-disable-next-line react-hooks/exhaustive-deps     
    }, [currentTurn])






    //Use the Pokemon API to retrieve all relevant data for a single Pokemon
    async function RetrieveDataForSinglePokemon(pokemonArg)
    {
        const singlePokemonRequest = await axios.get(pokemonArg.url); //Possible todo: cancel via abortController
        let dataFromSinglePokemon = (singlePokemonRequest.data);
        //console.log("Raw Pokemon Data: ", dataFromSinglePokemon);

        //Fetch a list of ALL possible moves for this Pokemon, and save into state 
        //Note: This is so that it doesn't need to be re-fetched if the player refreshes their moves
        let listOfPokemonMoveUrls = dataFromSinglePokemon.moves.map(m => m.move.url);
        setMostRecentlyRetrievedListOfMoveUrls(listOfPokemonMoveUrls);

        //Fetch all the relevant data for four randomly selected moves
        let retrievedPokemonMoves = [{}, {}, {}, {}];
        for (let i = 0; i < NumberOfMoves; i++)
        {
            const randomMoveUrlForPkmn = listOfPokemonMoveUrls[Math.floor(Math.random() * listOfPokemonMoveUrls.length)];
            const moveRequest = await axios.get(randomMoveUrlForPkmn)  //Possible todo: cancel via abortController
            const dataFromThisRandomMove = (moveRequest.data);

            //Possible todo: allow non-damaging moves to have their appropriate functionality (e.g. HP recovery) instead of simply forcing the minimum power to 10
            let newMove = new PokemonMove(
                dataFromThisRandomMove.name,
                dataFromThisRandomMove.type.name,
                dataFromThisRandomMove.power ?? 10,
            );

            retrievedPokemonMoves[i] = newMove;
        }


        //Fetch all of this Pokemon's relevant type data
        let typeDataUrl = dataFromSinglePokemon.types[0].type.url;
        let typeDataRequest = await axios.get(typeDataUrl)  //Possible todo: cancel via abortController
        let retrievedWeaknesses = [];
        let retrievedResistances = [];

        //console.log("Raw Type Data: ", typeDataRequest.data.damage_relations);

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
            retrievedResistances.push(typeDataRequest.data.damage_relations.no_damage_from[i].name) //Possible todo: separate dmg resistance from dmg immunity
        }


        //Assign all of the variables needed for this Pokemon, and return it
        let retrievedPokemon = new Pokemon(
            dataFromSinglePokemon.name,
            pokemonArg.url,
            dataFromSinglePokemon.types[0].type.name,
            //dataFromSinglePokemon.types[1].type.name,     //Possible todo: implement dual types
            retrievedWeaknesses,
            retrievedResistances,
            dataFromSinglePokemon.base_experience,
            dataFromSinglePokemon.base_experience,
            dataFromSinglePokemon.sprites.front_default,
            retrievedPokemonMoves,
        );

        console.log("Retrieved Pokemon: ", retrievedPokemon);

        return retrievedPokemon;
    }







    //Respond when the player choses one of their Pokemon's four moves
    async function ActivateAttackBtn(attackNumber) 
    {
        //Ensure only one click per turn
        if ((currentTurn !== "player") || (playerTurnInProgress.current === true)) return;  

        playerTurnInProgress.current = true;

        //Resolve the actual attack
        let attackResult = await ResolveAttack(playerPokemon, opponentPokemon, attackNumber);

        //Check for endgame state after player attack, otherwise continue with opponent's turn
        if (attackResult === "endgame")
        {
            setCurrentTurn("neutral");
            await PrintNewTerminalMsg(opponentPokemon.pokemonName.toUpperCase() + " fainted! You win!");
            setGameIsOver(true);
            return;
        }
        else if (attackResult === "continue")
        {
            playerTurnInProgress.current = false;
            setCurrentTurn("opponent");
            return;
        }

    }






    //This is where we actually crunch the math for attacks
    async function ResolveAttack(attackingPokemon, defendingPokemon, attackSelectionNum) 
    {
        attackSelectionNum--; //Because the attacks are numbered 1-4, and the corresponding 'moves' array is indexed at 0
        let chosenAttackPower = attackingPokemon.moves[attackSelectionNum].movePower / 2;  //Starting value for attack power is half of the movePower value from the API
        let chosenAttackType = attackingPokemon.moves[attackSelectionNum].moveType;
        let weaknessConfirmed = false;
        let resistanceConfirmed = false;

        
        //Check for weakness and resistance, and double or halve the attack's power
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

        await PrintNewTerminalMsg(attackingPokemon.pokemonName.toUpperCase() + " used " + attackingPokemon.moves[attackSelectionNum].moveName.toUpperCase() + "!");

        let defendingPokemonRemainingHP = defendingPokemon.curHP;
        defendingPokemonRemainingHP = defendingPokemonRemainingHP - chosenAttackPower;

        if (defendingPokemonRemainingHP < 0) {defendingPokemonRemainingHP = 0;}     //HP should never go negative

        //Set the attacked Pokemon's current HP to the new value, save it in state, and handle all animations
        if (currentTurn === "opponent")
        {
            setOpponentPokemonAnimation("attacking");
            await new Promise(r => setTimeout(r, 1800));
            setPlayerPokemonAnimation("receivingDmg");
            setPlayerPokemon( {...playerPokemon, curHP: defendingPokemonRemainingHP});
            await new Promise(r => setTimeout(r, 1800));
            setPlayerPokemonAnimation("neutral");
        }
        else if (currentTurn === "player")
        {
            setPlayerPokemonAnimation("attacking");
            await new Promise(r => setTimeout(r, 1800));
            setOpponentPokemonAnimation("receivingDmg");
            setOpponentPokemon( {...opponentPokemon, curHP: defendingPokemonRemainingHP});
            await new Promise(r => setTimeout(r, 1800));
            setOpponentPokemonAnimation("neutral");
        }

        //Classic.
        if (weaknessConfirmed)
            {await PrintNewTerminalMsg("It's super effective!");}
        else if (resistanceConfirmed)
            {await PrintNewTerminalMsg("It's not very effective...");}


        //If the attacked Pokemon has fainted, the game is over
        if (defendingPokemonRemainingHP > 0)
            {return "continue";}
        else
            {return "endgame"};
    }




    //Handle the player's Pokemon choice
    async function ActivatePokemonSelectionBtn(playerSelectedPokemon) 
    {
        //Loop through the fullPokemonList until we find the player's selection
        let selectedPokemon = {};
        for (let i = 0; i < fullPokemonList.length; i++)
        {
            if (fullPokemonList[i].name === playerSelectedPokemon)
            {
                selectedPokemon = fullPokemonList[i];
                break;
            }
        }

        //Retrieve all relevant data for the player's chosen Pokemon, and save that Pokemon in state
        RetrieveDataForSinglePokemon(selectedPokemon)
            .then(result => {
            setPlayerPokemon(result);
            })

        //Immediately following Pokemon selection, it becomes the player's turn
        setPlayerPokemonSelected(true);
        await PrintNewTerminalMsg("It's your turn!");
        setCurrentTurn("player");
    }

    //Handle the player's decision to refresh their Pokemon's four moves
    async function ActivateMoveRefreshBtn() 
    {
        //Disallow refresh if it is not the player's turn or if they have already made a selection
        if ((currentTurn !== "player") || (playerTurnInProgress.current === true)) return;

        playerTurnInProgress.current = true;

        await PrintNewTerminalMsg("Refreshing your Pokemon's attacks....");

        let listOfPokemonMoveUrls = mostRecentlyRetrievedListOfMoveUrls;
        let retrievedPokemonMoves = [{}, {}, {}, {}];

        //Possible todo: move this to a separate function, as it is the same as initial attack selection
        for (let i = 0; i < NumberOfMoves; i++)
        {
            const randomMoveUrlForPkmn = listOfPokemonMoveUrls[Math.floor(Math.random() * listOfPokemonMoveUrls.length)];
            const moveRequest = await axios.get(randomMoveUrlForPkmn)  //Possible todo: cancel via abortController
            const dataFromThisRandomMove = (moveRequest.data);

            let newMove = new PokemonMove(
                dataFromThisRandomMove.name,
                dataFromThisRandomMove.type.name,
                dataFromThisRandomMove.power ?? 10,
            );

            retrievedPokemonMoves[i] = newMove;
        }

        //Save the newly modified move array in state for the player's Pokemon
        let modifiedPlayerPokemon = playerPokemon; 
        modifiedPlayerPokemon.moves = retrievedPokemonMoves;
        setPlayerPokemon(modifiedPlayerPokemon);

        playerTurnInProgress.current = false;
        setCurrentTurn("opponent");
        return;

    }



    //Simple refresh to restart game
    function RefreshPage() 
    {
        window.location.reload(false);
    }
       
    
    //Any time we want to use the game's terminal, display the message and add an appropriate delay
    async function PrintNewTerminalMsg(msg) 
    {
        setPlayerTerminalMsg(msg);
        await new Promise(r => setTimeout(r, 1800));
    }


    //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    //Primary JSX here
    //vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

    if (loadingApiData) //LOADING SCREEN
    {
        return "";  //Possible todo: add UI elements for page loading
    }
    else if (playerPokemonSelected === false) //POKEMON SELECTION SCREEN
    {
        return (
        <>
            <div className="mainDisplay">
            <PokemonDisplay displayedPokemon={opponentPokemon} isPlayerPokemon={false}  />
            <PokemonSelection ActivatePokemonSelectionBtn={ActivatePokemonSelectionBtn} playerPokemonList={fullPokemonList} />
            </div>
        </>
        );
    }
    else    //MAIN GAME SCREEN
    {
        return(
        <>
            <div className="mainDisplay">
            <PokemonDisplay displayedPokemon={opponentPokemon} isPlayerPokemon={false} pokemonAnimation={opponentPokemonAnimation}  />
            <PokemonDisplay displayedPokemon={playerPokemon} isPlayerPokemon={true}  pokemonAnimation={playerPokemonAnimation}  />
            <div className="terminalAndBtns">
            <PlayerTerminal playerTerminalMsg={playerTerminalMsg} /> 
            <ActionButtons 
                    ActivateAttackBtn={ActivateAttackBtn}            //Pass the function for attacking
                    ActivateMoveRefreshBtn={ActivateMoveRefreshBtn}  //Pass the function for move-refresh
                    playersPokemon={playerPokemon}                   //Pass the player's pokemon, so its attacks can be displayed
                    />
            </div>
            {gameIsOver && <button className="gameOverBtn" onClick={RefreshPage}> Play Again ? </button>}
            </div>
        </>
        );
    }
}

export default App;




