import React, { useState } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';

function App() {
  const [game, setGame] = useState(new Chess());

  const handleMove = (move) => {
    try {
      // Intenta realizar el movimiento
      const result = game.move(move);

      if (result) {
        // Si el movimiento es válido, actualiza el estado con la posición actual
        setGame(new Chess(game.fen()));
      } else {
        console.warn("Movimiento inválido:", move);
      }
    } catch (error) {
      console.error("Error en el movimiento:", error);
    }
  };

  return (
    <div className="App">
      <h1>UCChess</h1>
      <Chessboard
        position={game.fen()}
        onDrop={({ sourceSquare, targetSquare }) => 
          handleMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // Promueve a reina por defecto
          })
        }
      />
    </div>
  );
}

export default App;
