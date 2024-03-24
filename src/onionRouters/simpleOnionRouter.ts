import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import { BASE_ONION_ROUTER_PORT } from '../config';
import * as crypto from '../crypto';


// Define a type for messages
type MessageType = {
  message: string;
  destination: number;
};

type payload = {
  result: string 
}

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  let privateKey: crypto.GenerateRsaKeyPair.CryptoKey | null = null;

  // Route to get the last received encrypted message
  onionRouter.get('/getLastReceivedEncryptedMessage', (req: Request, res: Response) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  // Route to get the last received decrypted message
  onionRouter.get('/getLastReceivedDecryptedMessage', (req: Request, res: Response) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  // Route to get the last message destination
  onionRouter.get('/getLastMessageDestination', (req: Request, res: Response) => {
    res.json({ result: lastMessageDestination });
  });

  // Route to register a node
  onionRouter.post('/registerNode', (req, res) => {
    const { nodeId, nodePort } = req.body;

    // Perform registration logic (customize this based on your requirements)
    console.log(`Node ${nodeId} registered on port ${nodePort}`);

    res.json({ result: 'Node registered successfully' });
  });

   // Route to get the private key
   onionRouter.get('/getPrivateKey', async (req, res) => {
    try {
      if (!privateKey) {
        // Generate a new RSA key pair if the private key is not available
        const keyPair = await crypto.generateRsaKeyPair();
        privateKey = keyPair.privateKey;
      }

      // Export the private key to a base64 string
      const privateKeyBase64 = await crypto.exportPrvKey(privateKey);

      res.json({ result: privateKeyBase64 });
    } catch (error) {
      console.error('Error retrieving private key:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // Implement the status route
  onionRouter.get('/status', (req: Request, res: Response) => {
    res.send('live');
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  // Middleware to capture and store received messages and their destination
  onionRouter.use((req: Request, res: Response, next) => {
    const { message, destination } = req.body as MessageType;

    lastReceivedEncryptedMessage = message;
    lastReceivedDecryptedMessage = decryptMessage(message);
    lastMessageDestination = destination;

    next();
  });

  return server;
}

// Function to simulate decryption logic (replace this with your actual decryption logic)
function decryptMessage(encryptedMessage: string): string {
  // Replace this with your decryption logic
  return `Decrypted: ${encryptedMessage}`;
}
