import React, { useState, useEffect, useRef } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';

function App() {
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState([game.fen()]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestMove, setBestMove] = useState(null); // Para almacenar la mejor jugada sugerida por Stockfish
  const stockfishRef = useRef(null);

  // Inicializa Stockfish
  useEffect(() => {
    stockfishRef.current = new Worker(`${process.env.PUBLIC_URL}/lib/stockfish-11.js`);
    stockfishRef.current.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith('bestmove')) {
        const bestMove = message.split(' ')[1];
        setBestMove(bestMove); // Actualiza el mejor movimiento
      }
    };

    return () => {
      stockfishRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isPlaying && currentMove < history.length - 1) {
      timer = setTimeout(() => {
        handleForward();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentMove]);

  const handleMove = (move) => {
    const newGame = new Chess(game.fen());

    try {
      if (newGame.move(move)) {
        setGame(newGame);

        const newHistory = history.slice(0, currentMove + 1);
        setHistory([...newHistory, newGame.fen()]);
        setMoveHistory(newGame.history());
        setCurrentMove(newHistory.length);

        // Envía la posición a Stockfish para calcular la mejor jugada
        stockfishRef.current.postMessage(`position fen ${newGame.fen()}`);
        stockfishRef.current.postMessage('go depth 15'); // Ajusta la profundidad según lo necesario
      } else {
        console.warn("Movimiento inválido:", move);
      }
    } catch (error) {
      console.error("Error en el movimiento:", error);
    }
  };

  const handleSliderChange = (event) => {
    const moveIndex = Number(event.target.value);
    setCurrentMove(moveIndex);
    setGame(new Chess(history[moveIndex]));
    setIsPlaying(false);
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

  const generateScoreSheet = () => {
    const moves = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const whiteMove = moveHistory[i];
      const blackMove = moveHistory[i + 1] || '';
      moves.push(`${i / 2 + 1}. ${whiteMove} ${blackMove}`);
    }
    return moves;
  };

  return (
    <div className="App">
      <h1>UCChess</h1>

      <div style={{ display: "flex" }}>
        <div>
          <Chessboard
            position={game.fen()}
            onDrop={({ sourceSquare, targetSquare }) => 
              handleMove({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
              })
            }
          />

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

          <input
            type="range"
            min="0"
            max={history.length - 1}
            value={currentMove}
            onChange={handleSliderChange}
            style={{ width: "100%", marginTop: "10px" }}
          />

          {/* Muestra la mejor jugada sugerida por Stockfish */}
          <div style={{ marginTop: "10px" }}>
            <strong>Mejor jugada sugerida: </strong>{bestMove || "Calculando..."}
          </div>
        </div>

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

