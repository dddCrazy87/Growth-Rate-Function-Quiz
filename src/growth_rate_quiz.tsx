import React, { useState, useEffect } from 'react';
import { Shuffle, Check, RotateCcw } from 'lucide-react';

/** 讓 TS 認得 window.MathJax */
declare global {
  interface Window {
    MathJax?: { typesetPromise?: () => Promise<void> };
  }
}

/** 單例：確保只載入一次 MathJax（從 CDN） */
let mathJaxLoading: Promise<void> | null = null;
function ensureMathJax(): Promise<void> {
  if (window.MathJax?.typesetPromise) return Promise.resolve();
  if (mathJaxLoading) return mathJaxLoading;

  mathJaxLoading = new Promise<void>((resolve, reject) => {
    // 可選：在載入前放設定（這裡用預設 inline \( \) 就好）
    const script = document.createElement('script');
    script.id = 'mathjax-cdn';
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('MathJax load failed'));
    document.head.appendChild(script);
  });

  return mathJaxLoading;
}

/** 型別定義 */
interface FuncItem {
  latex: string;
  category: string;
  rank: number;
}

const GrowthRateQuiz: React.FC = () => {
  const functions: FuncItem[] = [
    { latex: 'n^{2^n}', category: '指數又是指數', rank: 1 },
    { latex: '2^{2^{n+1}}', category: '指數又是指數', rank: 2 },
    { latex: '2^{2^n}', category: '指數又是指數', rank: 3 },
    { latex: 'n^n', category: '階乘', rank: 4 },
    { latex: '(n+1)!', category: '階乘', rank: 5 },
    { latex: 'n!', category: '階乘', rank: 6 },
    { latex: '(\\lg n)^n', category: '階乘', rank: 7 },
    { latex: 'e^n', category: '指數', rank: 8 },
    { latex: 'n \\cdot 2^n', category: '指數', rank: 9 },
    { latex: 'd^n, d>2', category: '指數', rank: 10 },
    { latex: '2^n', category: '指數', rank: 11 },
    { latex: '(\\frac{3}{2})^n', category: '指數', rank: 12 },
    { latex: '(1.0001)^n', category: '指數', rank: 13 },
    { latex: '(\\lg n)^{\\lg n} = n^{\\lg \\lg n}', category: '特殊', rank: 14 },
    { latex: '(\\lg n)!', category: '特殊', rank: 15 },
    { latex: 'n^d, d > 0', category: '多項式', rank: 16 },
    { latex: 'n^3', category: '多項式', rank: 17 },
    { latex: 'n^2 = 4^{\\lg n}', category: '多項式', rank: 18 },
    { latex: 'n \\lg n', category: '多項式', rank: 19 },
    { latex: '\\lg(n!)', category: '多項式', rank: 20 },
    { latex: 'n = 2^{\\lg n}', category: '多項式', rank: 21 },
    { latex: '(\\sqrt{2})^{\\lg n} = \\sqrt{n}', category: '多項式', rank: 22 },
    { latex: 'n^{0.001}', category: '多項式', rank: 23 },
    { latex: '2^{\\sqrt{2 \\lg n}}', category: '多項式', rank: 24 },
    { latex: '(\\lg \\lg n)!', category: '對數', rank: 25 },
    { latex: '\\lg^2 n', category: '對數', rank: 26 },
    { latex: '\\lg n = \\ln n', category: '對數', rank: 27 },
    { latex: '\\lg(n^d), d > 0', category: '對數', rank: 28 },
    { latex: '2^{\\sqrt{\\lg \\lg n}}', category: '對數', rank: 29 },
    { latex: '\\sqrt{\\lg n} = \\sqrt{2}^{\\lg \\lg n}', category: '對數', rank: 30 },
    { latex: '\\lg \\lg n = \\ln \\ln n', category: '對數', rank: 31 },
    { latex: '2^{\\lg^* n}', category: '對數', rank: 32 },
    { latex: '\\lg^* n', category: '對數', rank: 33 },
    { latex: '\\lg^*(\\lg n)', category: '對數', rank: 34 },
    { latex: '\\lg(\\lg^* n)', category: '對數', rank: 35 },
    { latex: 'O(1) = n^{\\frac{1}{\\lg n}} = 2', category: '常數', rank: 36 }
  ];

  const [numFunctions, setNumFunctions] = useState<number>(5);
  const [selectedFunctions, setSelectedFunctions] = useState<FuncItem[]>([]);
  const [userOrder, setUserOrder] = useState<FuncItem[]>([]);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  /** 首次掛載：載入 MathJax 並 typeset 一次（等到內容出現後也會再跑一次） */
  useEffect(() => {
    ensureMathJax()
      .then(() => window.MathJax?.typesetPromise?.())
      .catch(console.error);
  }, []);

  /** 每次內容或顯示狀態變動，都 re-typeset */
  useEffect(() => {
    ensureMathJax()
      .then(() => window.MathJax?.typesetPromise?.())
      .catch(console.error);
  }, [userOrder, showAnswer, numFunctions]);

  const generateQuiz = () => {
    const shuffled = [...functions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numFunctions);
    setSelectedFunctions(selected);
    setUserOrder([...selected]);
    setShowAnswer(false);
  };

  useEffect(() => {
    generateQuiz();
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...userOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);

    setUserOrder(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const checkAnswer = () => setShowAnswer(true);

  const isCorrect = (): boolean | null => {
    if (!showAnswer) return null;
    for (let i = 0; i < userOrder.length - 1; i++) {
      if (userOrder[i].rank > userOrder[i + 1].rank) return false;
    }
    return true;
  };

  // 避免在 render 裡每次都 sort 原陣列：先計算一份正確順序用於比對
  const correctOrder = React.useMemo(
    () => [...selectedFunctions].sort((a, b) => a.rank - b.rank),
    [selectedFunctions]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-900">
          漸進函數成長速度排序練習
        </h1>
        <p className="text-center text-gray-600 mb-8">將函數從成長最快排到最慢（拖曳排序）</p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="font-semibold text-gray-700">選擇函數數量：</label>
            <input
              type="number"
              min={2}
              max={functions.length}
              value={numFunctions}
              onChange={(e) =>
                setNumFunctions(Math.max(2, Math.min(functions.length, parseInt(e.target.value) || 5)))
              }
              className="border-2 border-gray-300 rounded px-3 py-2 w-20"
            />
            <button
              onClick={generateQuiz}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              <Shuffle size={18} />
              重新生成
            </button>
          </div>

          <div className="space-y-3">
            {userOrder.map((func, index) => (
              <div
                key={`${func.latex}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-gradient-to-r from-indigo-50 to-blue-50 border-2 p-4 rounded-lg cursor-move transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                  } ${showAnswer && userOrder[index].rank !== correctOrder[index]?.rank
                    ? 'border-red-400 bg-red-50'
                    : 'border-indigo-200'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-600 min-w-[40px]">{index + 1}</span>
                  <div className="flex-1">
                    {/* 注意：用 \( ... \) 作為 inline TeX，字串中要兩個反斜線 */}
                    <div className="text-xl">{`\\(${func.latex}\\)`}</div>
                    {showAnswer && <div className="text-sm text-gray-500 mt-1">{func.category}</div>}
                  </div>
                  {showAnswer && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">排名: {func.rank}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={checkAnswer}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <Check size={20} />
              檢查答案
            </button>
            <button
              onClick={() => {
                setUserOrder([...selectedFunctions]);
                setShowAnswer(false);
              }}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              <RotateCcw size={20} />
              重置排序
            </button>
          </div>

          {showAnswer && (
            <div
              className={`mt-6 p-4 rounded-lg ${isCorrect() ? 'bg-green-100 border-2 border-green-400' : 'bg-yellow-100 border-2 border-yellow-400'
                }`}
            >
              <p className="text-lg font-semibold">
                {isCorrect() ? '🎉 完全正確！' : '❌ 還有錯誤，請參考正確排名'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthRateQuiz;