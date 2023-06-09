import React from 'react'

export default function ActionBtns({ ActivateAttackBtn, ActivateMoveRefreshBtn, attackBtnText }) 
{
  return (
    <div>
          {<button onClick={() => ActivateAttackBtn(1)}> {attackBtnText[0].toUpperCase()} </button>} &nbsp; 
          {<button onClick={() => ActivateAttackBtn(2)}> {attackBtnText[1].toUpperCase()} </button>} &nbsp; 
          {<button onClick={() => ActivateAttackBtn(3)}> {attackBtnText[2].toUpperCase()} </button>} &nbsp; 
          {<button onClick={() => ActivateAttackBtn(4)}> {attackBtnText[3].toUpperCase()} </button>} &nbsp; || &nbsp;
          {<button onClick={ActivateMoveRefreshBtn}> Refresh Moves! </button>}
    </div>
  )
}

