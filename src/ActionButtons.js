import React from 'react'

export default function ActionBtns({ ActivateAttackBtn, ActivateMoveRefreshBtn, playersPokemon }) 
{
    //First, ensure that pokemon data has fully loaded
    let loaded = false;
    playersPokemon ? loaded=true : loaded=false
    if (loaded === false) {return "Loading Moves...";}

  return (
    <div className="actionbtns">
          {<button onClick={() => ActivateAttackBtn(1)}> {playersPokemon.moves[0].moveName.toUpperCase()} </button>} <br />
          {<button onClick={() => ActivateAttackBtn(2)}> {playersPokemon.moves[1].moveName.toUpperCase()} </button>} <br />
          {<button onClick={() => ActivateAttackBtn(3)}> {playersPokemon.moves[2].moveName.toUpperCase()} </button>} <br /> 
          {<button onClick={() => ActivateAttackBtn(4)}> {playersPokemon.moves[3].moveName.toUpperCase()} </button>} <br />
          <hr />
          {<button onClick={ActivateMoveRefreshBtn}> Refresh Moves! </button>}
    </div>
  )
}

