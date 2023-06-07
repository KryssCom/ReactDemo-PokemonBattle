import React from 'react'

export default function PlayerTerminal({ playerTerminalMsg })
{
    let NewStr = playerTerminalMsg;
    console.log("player terminal msg rcvd: " + NewStr);

return (
    <div>
        [TO PLAYER]: {playerTerminalMsg}
    </div>
  )
}
