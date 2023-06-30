import React from 'react'

export default function ActionBtns({ ActivateAttackBtn, ActivateMoveRefreshBtn, playersPokemon }) 
{
    //Ensure that Pokemon data has fully loaded before displaying
    let loaded = false;
    playersPokemon ? loaded=true : loaded=false
    if (loaded === false) {return  ""; }

  return (
    <div className="actionBtnDisplay">
          {<button className="attackBtn" onClick={() => ActivateAttackBtn(1)}> {playersPokemon.moves[0].moveName.toUpperCase()} </button>} <br />
          {<button className="attackBtn" onClick={() => ActivateAttackBtn(2)}> {playersPokemon.moves[1].moveName.toUpperCase()} </button>} <br />
          {<button className="attackBtn" onClick={() => ActivateAttackBtn(3)}> {playersPokemon.moves[2].moveName.toUpperCase()} </button>} <br /> 
          {<button className="attackBtn" onClick={() => ActivateAttackBtn(4)}> {playersPokemon.moves[3].moveName.toUpperCase()} </button>} <br />
          <hr />
          {<button className="refreshBtn" onClick={ActivateMoveRefreshBtn}> Refresh My Moves! </button>}
    </div>
  )
}

