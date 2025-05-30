import { useState, useEffect } from 'react';
import { originalQuizData } from './QuizData';

function shuffle(array) {
  const shuffledArray = array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffledArray.map((question) => {
    const variantObjects = question.variants.map((variant, index) => ({
      text: variant,
      originalIndex: index,
    }));

    const shuffledVariants = variantObjects
      .map((v) => ({ ...v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort);

    const newVariants = shuffledVariants.map((v) => v.text);

    const newAnswers = Array.isArray(question.answers)
      ? question.answers.map((a) =>
          shuffledVariants.findIndex((v) => v.originalIndex === a)
        )
      : shuffledVariants.findIndex((v) => v.originalIndex === question.answers);

    return {
      ...question,
      variants: newVariants,
      answers: newAnswers,
    };
  });
}

export default function QuizApp() {
  const [quizData, setQuizData] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    setQuizData(shuffle(originalQuizData));
  }, []);

  if (quizData.length === 0)
    return <div style={{ padding: '1rem' }}>Se încarcă întrebările...</div>;

  const question = quizData[index];
  const correct = Array.isArray(question.answers)
    ? question.answers
    : [question.answers];
  const isMultiple = Array.isArray(question.answers);

  const toggleSelection = (i) => {
    if (isMultiple) {
      setSelected((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      );
    } else {
      setSelected([i]);
    }
  };

  const isAnswerCorrect = () =>
    selected.length === correct.length &&
    selected.every((i) => correct.includes(i));

  const next = () => {
    if (index + 1 === quizData.length) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
      setSelected([]);
      setShowResult(false);
    }
  };

  const back = () => {
    setIndex((prev) => Math.max(0, prev - 1));
    setSelected([]);
    setShowResult(false);
  };

  if (finished) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        <h2>Ai finalizat quiz-ul!</h2>
        <p>Felicitări pentru completare.</p>
        <button
          onClick={() => {
            setQuizData(shuffle(originalQuizData));
            setIndex(0);
            setSelected([]);
            setShowResult(false);
            setUserAnswers([]);
            setFinished(false);
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6366f1',
            color: 'white',
            borderRadius: '4px',
            marginTop: '1rem',
          }}
        >
          Reluare
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '1rem',
      }}
    >
      <img
        src='img/misha.jpg'
        alt='misha'
        width={200}
        style={{ position: 'absolute', top: '20px', left: '20px', zIndex: -1 }}
      />
      <img
        src='img/lgbt.jpg'
        alt='lgbt'
        width={200}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: -1,
        }}
      />
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
        Întrebarea {index + 1} din {quizData.length}: {question.question}
      </h2>

      <div style={{ marginTop: '1rem' }}>
        {question.variants.map((variant, i) => {
          const isCorrectAnswer = showResult && correct.includes(i);
          const isWrongAnswer =
            showResult && selected.includes(i) && !correct.includes(i);

          const bgColor = isCorrectAnswer
            ? '#d1fae5'
            : isWrongAnswer
            ? '#fee2e2'
            : selected.includes(i)
            ? '#bfdbfe'
            : '#f3f4f6';

          const borderColor = isCorrectAnswer
            ? '#10b981'
            : isWrongAnswer
            ? '#ef4444'
            : selected.includes(i)
            ? '#3b82f6'
            : '#d1d5db';

          return (
            <div
              key={i}
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                borderRadius: '6px',
                border: `2px solid ${borderColor}`,
                backgroundColor: bgColor,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <input
                  type={isMultiple ? 'checkbox' : 'radio'}
                  name='answer'
                  checked={selected.includes(i)}
                  onChange={() => toggleSelection(i)}
                  disabled={showResult}
                  style={{ marginRight: '0.5rem' }}
                />
                {variant}
              </label>
            </div>
          );
        })}
      </div>

      {showResult && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '6px',
            color: 'white',
            backgroundColor: isAnswerCorrect() ? '#10b981' : '#ef4444',
          }}
        >
          {isAnswerCorrect()
            ? 'Răspunsul este corect!'
            : 'Răspuns greșit. Răspunsul corect este evidențiat cu verde.'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        {index > 0 && (
          <button
            onClick={back}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid gray',
              borderRadius: '4px',
            }}
          >
            Înapoi
          </button>
        )}
        {!showResult ? (
          <button
            onClick={() => {
              const isCorrect = isAnswerCorrect();
              const newAnswers = [...userAnswers];
              newAnswers[index] = { selected, isCorrect };
              setUserAnswers(newAnswers);
              setShowResult(true);
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Verifică răspunsul
          </button>
        ) : (
          <button
            onClick={next}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Continuă
          </button>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginTop: '2rem',
        }}
      >
        {quizData.map((_, i) => {
          const answer = userAnswers[i];
          let bg = 'orchid';

          if (i === index) bg = '#3b82f6';
          else if (answer?.isCorrect) bg = '#10b981';
          else if (answer && !answer.isCorrect) bg = '#ef4444';

          return (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                setSelected(userAnswers[i]?.selected || []);
                setShowResult(!!userAnswers[i]);
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '25%',
                backgroundColor: bg,
                color: 'white',
                border: 'none',
                fontWeight: 'bold',
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
