import bodyParser from 'body-parser';
import express from 'express';
import { BASE_USER_PORT } from '../config';

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let lastReceivedMessage:string | null = null;
  let lastSentMessage : string | null  = null;

  // Route to get the last received message
  _user.get('/getLastReceivedMessage', (req, res) => {
    res.json({ result: lastReceivedMessage });
  });

  // Route to get the last sent message
  _user.get('/getLastSentMessage', (req, res) => {
    res.json({ result: lastSentMessage });
  });

  // Implement the status route
  _user.get('/status', (req, res) => {
    res.send('live');
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  // Middleware to capture and store received messages
  _user.use((req, res, next) => {
    lastReceivedMessage = req.body.message; // Assuming the received message is in the request body
    next();
  });

  // Route to send a message to another user
  _user.post('/sendMessage', (req, res) => {
    const { message, destinationUserId }: SendMessageBody = req.body;

    // Replace this with your actual sending logic
    console.log(`Sending message to user ${destinationUserId}: ${message}`);
    lastSentMessage = message;

    res.json({ result: 'Message sent successfully' });
  });

  return server;
}
