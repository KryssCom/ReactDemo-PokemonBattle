import React from 'react'

export default function PlayerTerminal({ playerTerminalMsg })
{
    //console.log("player terminal msg rcvd: " + playerTerminalMsg);

    return (
        <div className="terminal">
            {playerTerminalMsg}
        </div>
    )
}
