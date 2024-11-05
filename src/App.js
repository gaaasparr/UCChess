import React, { useState, useEffect } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';

function App() {
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState([game.fen()]); // Guarda las posiciones FEN
  const [moveHistory, setMoveHistory] = useState([]); // Guarda las jugadas en notación algebraica
  const [currentMove, setCurrentMove] = useState(0); // Controla la posición en el historial
  const [isPlaying, setIsPlaying] = useState(false); // Controla si se está reproduciendo la partida automáticamente

  useEffect(() => {
    let timer;
    if (isPlaying && currentMove < history.length - 1) {
      timer = setTimeout(() => {
        handleForward();
      }, 1000); // Ajusta la velocidad de reproducción (en milisegundos)
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentMove]);

  const handleMove = (move) => {
    const newGame = new Chess(game.fen());

    try {
      // Intenta realizar el movimiento
      if (newGame.move(move)) {
        // Si el movimiento es válido, actualiza el estado
        setGame(newGame);

        // Actualiza el historial de FEN y el historial de movimientos en notación algebraica
        const newHistory = history.slice(0, currentMove + 1);
        setHistory([...newHistory, newGame.fen()]);
        setMoveHistory(newGame.history()); // Actualiza el historial de movimientos en notación algebraica
        setCurrentMove(newHistory.length); // Actualiza la posición al final del historial
      } else {
        console.warn("Movimiento inválido:", move);
      }
    } catch (error) {
      console.error("Error en el movimiento:", error);
    }
  };

  const handleSliderChange = (event) => {
    const moveIndex = Number(event.target.value);
    setCurrentMove(moveIndex); // Cambia la posición actual en el historial
    setGame(new Chess(history[moveIndex])); // Actualiza el tablero a la posición seleccionada
    setIsPlaying(false); // Detiene la reproducción automática si el usuario usa el slider
  };

  const handleBack = () => {
    if (currentMove > 0) {
      setCurrentMove(currentMove - 1);
      setGame(new Chess(history[currentMove - 1]));
    }
  };

  const handleForward = () => {
    if (currentMove < history.length - 1) {
      setCurrentMove(currentMove + 1);
      setGame(new Chess(history[currentMove + 1]));
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Genera una planilla acumulativa en formato de ajedrez estándar
  const generateScoreSheet = () => {
    const moves = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const whiteMove = moveHistory[i];
      const blackMove = moveHistory[i + 1] || ''; // Puede no haber movimiento negro en el último par
      moves.push(`${i / 2 + 1}. ${whiteMove} ${blackMove}`);
    }
    return moves;
  };

  return (
    <div className="App">
      <h1>UCChess</h1>

      <div style={{ display: "flex" }}>
        {/* Tablero de ajedrez */}
        <div>
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

          {/* Barra de navegación con flechas y botón de reproducción automática */}
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <button onClick={handleBack} disabled={currentMove === 0}>
              ⬅️ Anterior
            </button>
            <span style={{ margin: "0 10px" }}>Movimiento: {currentMove} / {history.length - 1}</span>
            <button onClick={handleForward} disabled={currentMove === history.length - 1}>
              Siguiente ➡️
            </button>
          </div>

          <button onClick={togglePlay} style={{ marginTop: "10px" }}>
            {isPlaying ? "⏸️ Pausar" : "▶️ Reproducir"}
          </button>

          {/* Barra deslizante para adelantar y retroceder jugadas */}
          <input
            type="range"
            min="0"
            max={history.length - 1}
            value={currentMove}
            onChange={handleSliderChange}
            style={{ width: "100%", marginTop: "10px" }}
          />
        </div>

        {/* Planilla completa de jugadas en formato estándar */}
        <div style={{ marginLeft: "20px" }}>
          <h2>Planilla de Jugadas</h2>
          <div style={{
            whiteSpace: "pre-wrap", 
            fontFamily: "monospace",
            fontSize: "14px",
            border: "1px solid #ddd",
            padding: "10px",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            {generateScoreSheet().map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
