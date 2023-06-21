import React from 'react'

export default function PlayerTerminal({ playerTerminalMsg })
{
    //console.log("player terminal msg rcvd: " + playerTerminalMsg);

    return (
        <div class="terminal">
            {playerTerminalMsg}
        </div>
    )
}
