type PredictRes = { correct: string; choices: string[] };

export const AttackBox: React.FC = () => {
  const callPredict = async (word: string): Promise<PredictRes> => {
    const res = await fetch("http://127.0.0.1:8000/predict", { //Chane To Your Ip
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, n_fake: 4 }),
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f5d24d",
        border: "3px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={async () => {
        const word = (((window as any).__currentWord as string) || "").trim().toLowerCase();
        if (!word) {
          // ถ้าไม่มีคำ ก็ล้างช่องให้เหมือนกดทิ้ง
          window.dispatchEvent(new CustomEvent("resetWordSlots"));
          (window as any).__currentWord = "";
          return;
        }

        try {
          const data = await callPredict(word);
          const correct = (data.correct || "").trim().toLowerCase();

          if (word === correct) {
            // ✅ ตีได้
            window.dispatchEvent(new CustomEvent("attack", { detail: { word } }));
          } else {
            // ❌ ตีไม่ได้
            alert("คำไม่ตรงกับ correct เลยตีไม่ได้");
          }
        } catch (err) {
          console.error(err);
          alert("เรียก API ไม่ได้ (เช็คว่า server รันอยู่ และ CORS)");
        } finally {
          // ล้างคำเสมอ ไม่ว่าตีผ่านหรือไม่ผ่าน
          window.dispatchEvent(new CustomEvent("resetWordSlots"));
          (window as any).__currentWord = "";
        }
      }}

    >
      Attack
    </div>
  );
};
