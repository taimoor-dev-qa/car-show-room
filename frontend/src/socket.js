import { io } from 'socket.io-client';

const socket = io('http://localhost:3500', { autoConnect: false });

export default socket;
