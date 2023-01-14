import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useGesture } from '@use-gesture/react';
import { useSprings, animated } from 'react-spring';

const CARD_COUNT = 5;
const SWIPE_THRESHOLD = 50;

const Index = () => {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    // Fetch the initial set of cards
    const fetchCards = async () => {
      const newCards = await Promise.all(
        Array.from({ length: CARD_COUNT }, (_, i) => i).map(fetchCard)
      );
      setCards(newCards);
    };
    fetchCards();
  }, []);

  const fetchCard = async (i) => {
    const width = Math.floor(0.8 * window.innerWidth);
    const height = Math.floor(0.8 * window.innerHeight);
    const url = `https://picsum.photos/${width}/${height}?random=${i}`;
    const res = await fetch(url);
    return res.url;
  }

  const [springs, setSprings] = useSprings(CARD_COUNT, (i) => ({
    x: 0,
    y: 0,
    config: { mass: 1, tension: 120, friction: 20 },
  }));

  const bind = useGesture({
    onDrag: ({ offset: [x, y], first, last, direction: [xDirection, yDirection] }) => {
      // Update the position of the top card
      setSprings((i) => {
        if (i !== index) return;
        return { x, y };
      });

      // Check if the card has been swiped beyond the threshold
      if (!last) return;
      if (Math.abs(x) > SWIPE_THRESHOLD) {
        console.log(x > 0 ? 'right' : 'left');
        setIndex((i) => (i + 1) % CARD_COUNT);
        setSprings((i) => {
          if (i !== index) return;
          return { x: x > 0 ? window.innerWidth : -window.innerWidth, y };
        });
      } else if (Math.abs(y) > SWIPE_THRESHOLD) {
        console.log(y > 0 ? 'bottom' : 'top');
        setIndex((i) => (i + 1) % CARD_COUNT);
        setSprings((i) => {
          if (i !== index) return;
          return { x, y: y > 0 ? window.innerHeight : -window.innerHeight };
        });
      } else {
        // If the card has not been swiped far enough, return it to its initial position
        setSprings((i) => {
          if (i !== index) return;
          return { x: 0, y: 0 };
        });
      }
    },
  });

  return (
    <div>
      {springs.map(({ x, y }, i) => {
        // Only render the top card
        if (i !== index) return null;
        
        return (
          <animated.div
            key={i}
            {...bind()}
            style={{
              // transform: x.to((x) => `translate3d(${x}px, 0, 0)`),
              touchAction: "none",
              position: "absolute",
              zIndex: CARD_COUNT - i,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            <animated.div
              style={{
                transform: y.to((y) => `translate3d(0, ${y}px, 0)`),
                touchAction: "none",
                position: "absolute",
                zIndex: CARD_COUNT - i,
              }}
            >
              <img src={cards[i]} alt={`Card ${i}`} style={{ width: '80%', height: '80%' }}/>
            </animated.div>
          </animated.div>
        );
      })}
    </div>
  );
}

var container = document.getElementById('root');
var root = createRoot(container);
root.render(<Index />);
