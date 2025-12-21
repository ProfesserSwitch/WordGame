import React, { useEffect, useState, useRef } from "react";
import { useGameStore } from "./store/useGameStore";
import { GameWorld } from "./components/GameWorld";
import { GameUI } from "./components/GameUI";
import { uiStyles } from "./styles/gameStyles";
import { LETTER_DATA } from "./constants";
import type { InventoryItem, DictEntry } from "./types";

export default function GameApp() {
  const store = useGameStore();
  
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [letterBag, setLetterBag] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<(InventoryItem | null)[]>(
    new Array(6).fill(null)
  );
  
  const [animFrame, setAnimFrame] = useState(0);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerAtkFrame, setPlayerAtkFrame] = useState(0);
  
  const [dictionary, setDictionary] = useState<DictEntry[]>([]);
  const [validWordInfo, setValidWordInfo] = useState<DictEntry | null>(null);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    fetch("http://localhost:3000/dict")
      .then((res) => res.json())
      .then((data) => setDictionary(data))
      .catch(() => {});
    
    const bag: string[] = [];
    Object.entries(LETTER_DATA).forEach(([char, info]) => {
      for (let i = 0; i < info.count; i++) bag.push(char);
    });
    setLetterBag(bag);
  }, []);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = time - lastTimeRef.current;
      if (dt < 100) store.update(dt);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAnimFrame((f) => (f === 0 ? 1 : 0)), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (store.gameState === "BATTLE_PLAYER") {
        const needed = 12 - inventory.length;
        if (needed <= 0 || letterBag.length === 0) return;
        const drawn: InventoryItem[] = [];
        for (let i = 0; i < needed; i++) {
          const char = letterBag[Math.floor(Math.random() * letterBag.length)];
          drawn.push({ char, id: Math.random(), visible: true });
        }
        setInventory((prev) => [...prev, ...drawn]);
    }
  }, [store.gameState]);

  useEffect(() => {
    const currentString = selectedLetters
      .filter((l) => l !== null)
      .map((l) => l?.char)
      .join("")
      .toLowerCase();
    if (currentString.length === 0) {
      setValidWordInfo(null);
      return;
    }
    const found = dictionary.find(
      (d) => d.word.toLowerCase() === currentString
    );
    setValidWordInfo(found || null);
  }, [selectedLetters, dictionary]);

  const handleAttack = async () => {
    if (
      !validWordInfo ||
      store.enemies.length === 0 ||
      store.gameState !== "BATTLE_PLAYER"
    )
      return;

    const aliveEnemies = store.enemies.filter((e) => e.hp > 0);
    let targetId = selectedTargetId;
    if (!targetId || !aliveEnemies.find(e => e.id === targetId)) {
        targetId = aliveEnemies[0]?.id;
    }
    if (!targetId) return;

    const activeItems = selectedLetters.filter(
      (l): l is InventoryItem => l !== null
    );
    const score = activeItems.reduce(
      (acc, item) => acc + (LETTER_DATA[item.char]?.score || 1),
      0
    );

    setValidWordInfo(null);
    setSelectedLetters(new Array(6).fill(null));
    
    setIsPlayerAttacking(true);
    setPlayerAtkFrame(1);
    setTimeout(() => setPlayerAtkFrame(2), 200);
    setTimeout(() => {
      setIsPlayerAttacking(false);
      setPlayerAtkFrame(0);
    }, 400);

    await store.endPlayerTurn(score * 10, targetId);
  };

  const handleSpin = () => {
    if (store.gameState !== "BATTLE_PLAYER" || letterBag.length === 0) return;
    
    setSelectedLetters(new Array(6).fill(null));
    const newDrawn: InventoryItem[] = [];
    for (let i = 0; i < 12; i++) {
      const char = letterBag[Math.floor(Math.random() * letterBag.length)];
      newDrawn.push({ char, id: Math.random(), visible: true });
    }
    setInventory(newDrawn);
  };

  const handleSelectLetter = (item: InventoryItem) => {
    const empty = selectedLetters.indexOf(null);
    if (empty !== -1 && store.gameState === "BATTLE_PLAYER") {
      const next = [...selectedLetters];
      next[empty] = item;
      setSelectedLetters(next);
      setInventory((p) => p.filter((it) => it.id !== item.id));
    }
  };

  const handleDeselectLetter = (index: number) => {
      const item = selectedLetters[index];
      if (item && store.gameState === "BATTLE_PLAYER") {
        setInventory((prev) => [...prev, item]);
        const next = [...selectedLetters];
        next[index] = null;
        setSelectedLetters(next);
      }
  };

  const handleResetLetters = () => {
      if (store.gameState === "BATTLE_PLAYER") {
        const toReturn = selectedLetters.filter(
          (l): l is InventoryItem => l !== null
        );
        setInventory((prev) => [...prev, ...toReturn]);
        setSelectedLetters(new Array(6).fill(null));
      }
  };

  return (
    <div style={uiStyles.wrapper}>
      <div style={uiStyles.gameContainer}>
        
        <GameWorld 
            animFrame={animFrame}
            isPlayerAttacking={isPlayerAttacking}
            playerAtkFrame={playerAtkFrame}
            selectedTargetId={selectedTargetId}
            setSelectedTargetId={setSelectedTargetId}
            validWordInfo={validWordInfo}
        />

        <GameUI 
            inventory={inventory}
            selectedLetters={selectedLetters}
            validWordInfo={validWordInfo}
            onSelectLetter={handleSelectLetter}
            onDeselectLetter={handleDeselectLetter}
            onAttack={handleAttack}
            onSpin={handleSpin}
            onResetLetters={handleResetLetters}
        />

      </div>
    </div>
  );
}