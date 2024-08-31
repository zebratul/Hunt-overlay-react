// src/TwitchChat.js
import React, { useEffect, useState } from 'react';
import tmi from 'tmi.js';

const SERVER_URL = 'https://hunt-overlay.onrender.com'; // Replace with your server's URL
const CHATBOT_TEXT = 'The shadows whisper: ';
const WELCOME_MESSAGE = `${CHATBOT_TEXT} Welcome to the stream! The options are: !shoot to fire, !jump to well... jump`;

const TwitchChat = () => {
  const [healthState, setHealthState] = useState('FULL');
  const [twitchClient, setTwitchClient] = useState(null);
  const [lastBotMessage, setLastBotMessage] = useState('');

  useEffect(() => {
    connectToTwitch();
  }, []);

  useEffect(() => {
    // Set interval to send a welcome message every 5 minutes
    const intervalId = setInterval(() => {
      sendWelcomeMessage();
    }, 300000); // 300,000 ms = 5 minutes

    return () => clearInterval(intervalId);
  }, [twitchClient, lastBotMessage]);

  const connectToTwitch = async () => {
    try {
      // Refresh the token
      await fetch(`${SERVER_URL}/refresh-token`, { method: 'POST' });

      // Fetch the Twitch token from the backend
      const tokenResponse = await fetch(`${SERVER_URL}/twitch-token`);
      const tokenData = await tokenResponse.json();
      const token = tokenData.access_token;

      // Create a new Twitch client
      const client = new tmi.Client({
        options: { debug: true },
        identity: {
          username: 'TheWatcher', // Replace with your bot's username
          password: `oauth:${token}`, // Use the token received from your backend
        },
        channels: ['zebratul'], // Replace with your Twitch channel name
      });

      // Connect to Twitch chat
      client.connect();

      // Listen for messages
      client.on('message', (channel, tags, message, self) => {
        if (message.toLowerCase() === '!hp') {
          client.say(channel, `${CHATBOT_TEXT} Current health is: ${healthState}`);
        } else if (message.toLowerCase() === '!commands') {
          client.say(channel, `${CHATBOT_TEXT} The options are: !shoot to fire, !jump to well... jump`);
        } else if (message.toLowerCase() === '!jump') {
          handleCommand(tags['display-name'], 'JUMP', channel, client);
        } else if (message.toLowerCase() === '!shoot') {
          handleCommand(tags['display-name'], 'LMB', channel, client);
        }
      });

      // Handle 401 Unauthorized errors
      client.on('connected', () => {
        setTwitchClient(client);
      });

      client.on('disconnected', (reason) => {
        console.error('Disconnected from Twitch:', reason);
        if (reason === 'Authentication failed') {
          refreshTwitchToken();
        }
      });

    } catch (error) {
      console.error('Error connecting to Twitch:', error);
    }
  };

  const handleCommand = async (userName, command, channel, client) => {
    try {
      const response = await fetch(`${SERVER_URL}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, userName }),
      });

      const result = await response.json();
      console.log('command result', result);

      if (result.status === 'success') {
        client.say(channel, `${CHATBOT_TEXT}@${userName} Your words are my command.`);
      } else if (result.status === 'cooldown') {
        client.say(channel, `${CHATBOT_TEXT}@${userName} You cannot do that yet.`);
      } else {
        client.say(channel, `${CHATBOT_TEXT}@${userName} A mishap: ${result.message}`);
      }
    } catch (error) {
      client.say(channel, `${CHATBOT_TEXT}@${userName} A request has gone awry. Perhaps, try again later.`);
      console.error('Error sending command:', error);
    }
  };

  const sendWelcomeMessage = () => {
    if (twitchClient && lastBotMessage !== WELCOME_MESSAGE) {
      twitchClient.say('zebratul', WELCOME_MESSAGE);
      setLastBotMessage(WELCOME_MESSAGE);
    }
  };

  const refreshTwitchToken = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/refresh-token`, { method: 'POST' });
      const data = await response.json();
      console.log('Twitch token refreshed:', data.access_token);
      if (twitchClient) {
        twitchClient.disconnect();
        connectToTwitch();
      }
    } catch (error) {
      console.error('Error refreshing Twitch token:', error);
    }
  };

  return (
    <div>
      <h2>Twitch Chat Bot</h2>
      <p>Listening to chat commands...</p>
    </div>
  );
};

export default TwitchChat;
