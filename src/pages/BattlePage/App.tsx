import React, { useEffect, useState, useRef } from "react";
import { useGameStore } from "./store/useGameStore";
import { GameWorld } from "./components/GameWorld";
import { uiStyles } from "./styles/gameStyles";
import { LETTER_DATA } from "./constants";
import type { InventoryItem, DictEntry } from "./types";

export default function GameApp() {
  const store = useGameStore();

  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);

  // ✅ 1. Inventory supports nulls (Fixed 16 Slots)
  const [inventory, setInventory] = useState<(InventoryItem | null)[]>(
    new Array(16).fill(null)
  );

  const [letterBag, setLetterBag] = useState<string[]>([]);

  const [selectedLetters, setSelectedLetters] = useState<(InventoryItem | null)[]>(
    new Array(6).fill(null)
  );

  const [animFrame, setAnimFrame] = useState(0);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerAtkFrame, setPlayerAtkFrame] = useState(0);

  const [validWordInfo, setValidWordInfo] = useState<DictEntry | null>(null);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // --- Initial Setup ---
  useEffect(() => {
    fetch("http://localhost:3000/dict")
      .then((res) => res.json())
      .then((data) => {
        store.setDictionary(data);
      })
      .catch(() => {});

    // Prepare letter bag
    const bag: string[] = [];
    Object.entries(LETTER_DATA).forEach(([char, info]) => {
      for (let i = 0; i < info.count; i++) bag.push(char);
    });
    setLetterBag(bag);
  }, []);

  // --- Animation Loop ---
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

  // --- Inventory Management Logic ---

  // Helper to fill inventory to 16 slots (without deleting existing items)
  const fillInventory = (currentInv: (InventoryItem | null)[]) => {
    if (letterBag.length === 0) return currentInv;

    const newInv = [...currentInv];
    const emptyCount = newInv.filter((x) => x === null).length;

    if (emptyCount > 0) {
      for (let i = 0; i < newInv.length; i++) {
        if (newInv[i] === null) {
          const char = letterBag[Math.floor(Math.random() * letterBag.length)];
          newInv[i] = { char, id: Math.random(), visible: true };
        }
      }
    }
    return newInv;
  };

  useEffect(() => {
    if (store.gameState === "PLAYERTURN") {
      setInventory((prev) => fillInventory(prev));
    }
  }, [store.gameState, letterBag]);

  // --- Word Checking Logic ---
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
    const found = store.dictionary.find(
      (d) => d.word.toLowerCase() === currentString
    );
    setValidWordInfo(found || null);
  }, [selectedLetters, store.dictionary]);

  // --- Actions ---

  const handleAttack = async () => {
    if (
      !validWordInfo ||
      store.enemies.length === 0 ||
      store.gameState !== "PLAYERTURN"
    )
      return;

    const aliveEnemies = store.enemies.filter((e) => e.hp > 0);
    let targetId = selectedTargetId;
    if (!targetId || !aliveEnemies.find((e) => e.id === targetId)) {
      targetId = aliveEnemies[0]?.id;
    }
    if (!targetId) return;

    const activeItems = selectedLetters.filter(
      (l): l is InventoryItem => l !== null
    );
    const chosenWord = activeItems.map((item) => item.char).join("");

    setValidWordInfo(null);
    setSelectedLetters(new Array(6).fill(null));

    setIsPlayerAttacking(true);
    setPlayerAtkFrame(1);
    setTimeout(() => setPlayerAtkFrame(2), 400);
    setTimeout(() => {
      setIsPlayerAttacking(false);
      setPlayerAtkFrame(0);
    }, 1000);

    await store.playAction(chosenWord, targetId);
  };

  const handleSpin = () => {
    if (store.gameState !== "PLAYERTURN" || letterBag.length === 0) return;

    setSelectedLetters(new Array(6).fill(null));

    // Reset all 16 slots
    const newInv = new Array(16).fill(null).map(() => {
      const char = letterBag[Math.floor(Math.random() * letterBag.length)];
      return { char, id: Math.random(), visible: true };
    });
    setInventory(newInv);
  };

  // ✅ Fix: Select replaces slot with null instead of deleting
  const handleSelectLetter = (item: InventoryItem, index: number) => {
    const emptyIndex = selectedLetters.indexOf(null);

    if (emptyIndex !== -1 && store.gameState === "PLAYERTURN") {
      // 1. Add to Selected Bar
      const nextSelected = [...selectedLetters];
      nextSelected[emptyIndex] = item;
      setSelectedLetters(nextSelected);

      // 2. Replace Inventory slot with null
      const nextInventory = [...inventory];
      nextInventory[index] = null;
      setInventory(nextInventory);
    }
  };

  // ✅ Fix: Deselect puts item back into first empty slot
  const handleDeselectLetter = (index: number) => {
    const item = selectedLetters[index];
    if (item && store.gameState === "PLAYERTURN") {
      // 1. Find empty slot in Inventory
      const emptyInvIndex = inventory.indexOf(null);
      if (emptyInvIndex !== -1) {
        const nextInventory = [...inventory];
        nextInventory[emptyInvIndex] = item;
        setInventory(nextInventory);

        // 2. Remove from Selected Bar
        const nextSelected = [...selectedLetters];
        nextSelected[index] = null;
        setSelectedLetters(nextSelected);
      }
    }
  };

  // ✅ Fix: Reset returns all items to empty slots
  const handleResetLetters = () => {
    if (store.gameState === "PLAYERTURN") {
      const itemsToReturn = selectedLetters.filter(
        (l): l is InventoryItem => l !== null
      );

      if (itemsToReturn.length === 0) return;

      const nextInventory = [...inventory];
      let itemIdx = 0;

      for (let i = 0; i < nextInventory.length; i++) {
        if (nextInventory[i] === null && itemIdx < itemsToReturn.length) {
          nextInventory[i] = itemsToReturn[itemIdx];
          itemIdx++;
        }
      }

      setInventory(nextInventory);
      setSelectedLetters(new Array(6).fill(null));
    }
  };

  return (
    <div style={uiStyles.wrapper}>
      <div style={uiStyles.gameContainer}>
        {/* GameWorld: Renders everything including Inventory UI */}
        <GameWorld
          animFrame={animFrame}
          isPlayerAttacking={isPlayerAttacking}
          playerAtkFrame={playerAtkFrame}
          selectedTargetId={selectedTargetId}
          setSelectedTargetId={setSelectedTargetId}
          validWordInfo={validWordInfo}
          
          inventory={inventory}
          selectedLetters={selectedLetters}
          
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