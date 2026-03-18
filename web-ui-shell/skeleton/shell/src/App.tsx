import { lazy, Suspense, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

// Dynamically import the remote Button component
const Button = lazy(
  // @ts-ignore
  async () => import('remote_app/Button'),
);

function App() {
  const [count, setCount] = useState(0);
  const [helloMessage, setHelloMessage] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [randomMessage, setRandomMessage] = useState('');

  const fetchMessage = async () => {
    try {
      const response = await fetch('/store/inventory', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const text = await response.text();
      setHelloMessage(text);
    } catch (error) {
      console.error(error);
      setHelloMessage('Failed to fetch');
    }
  };

    const fetchWelcomeMessage = async () => {
      try {
        const response = await fetch('/service1/welcome', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent
          headers: {
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const text = await response.text();
        setWelcomeMessage(text);
      } catch (error) {
        console.error(error);
        setWelcomeMessage('Failed to fetch');
      }
    };

  const fetchRandomNumber = async () => {
    try {
      const response = await fetch('/service2/random', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const text = await response.text();
      setRandomMessage(text);
    } catch (error) {
      console.error(error);
      setRandomMessage('Failed to fetch');
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Welcome to the Shell App</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <br/>
        <button onClick={fetchMessage}>Fetch Hello</button>
        <p>{helloMessage}</p>

        <button onClick={fetchWelcomeMessage}>Fetch Welcome</button>
        <p>{welcomeMessage}</p>


        <button onClick={fetchRandomNumber}>Fetch Random Number</button>
        <p>{randomMessage}</p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        {/* Render the remote Button */}
        <Suspense fallback="loading...">
          <Button />
        </Suspense>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
