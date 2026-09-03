import { useEffect, useState } from "react";

type Typewriter = {
  displayed: string;
  done: boolean;
};

/**
 * Reveals `text` one character at a time.
 *
 * @param speed      milliseconds between characters
 * @param startDelay milliseconds to wait before the first character
 */
export function useTypewriter(
  text: string,
  speed = 38,
  startDelay = 600,
): Typewriter {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    let interval: ReturnType<typeof setInterval> | undefined;

    const start = setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
