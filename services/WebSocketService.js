import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();

    // Get WebSocket URL from environment variables
    const wsMode = process.env.EXPO_PUBLIC_WS_MODE || "local";
    const localUrl =
      process.env.EXPO_PUBLIC_WS_URL_LOCAL || "http://localhost:8080";
    const ngrokUrl = process.env.EXPO_PUBLIC_WS_URL_NGROK;
    const productionUrl = process.env.EXPO_PUBLIC_WS_URL_PRODUCTION;

    console.log("Environment variables:", {
      wsMode: process.env.EXPO_PUBLIC_WS_MODE,
      localUrl: process.env.EXPO_PUBLIC_WS_URL_LOCAL,
      ngrokUrl: process.env.EXPO_PUBLIC_WS_URL_NGROK,
      productionUrl: process.env.EXPO_PUBLIC_WS_URL_PRODUCTION,
    });

    // Use URLs directly from environment variables and add /ws
    switch (wsMode) {
      case "local":
        this.wsUrl = localUrl + "/ws";
        break;
      case "production":
        this.wsUrl = productionUrl + "/ws";
        break;
      case "ngrok":
      default:
        this.wsUrl = ngrokUrl + "/ws";
        break;
    }
    console.log(`WebSocket mode: ${wsMode}, URL: ${this.wsUrl}`);
  }

  connect() {
    return new Promise((resolve, reject) => {
      console.log("Attempting to connect to WebSocket...");

      // Create STOMP client with SockJS transport
      this.client = new Client({
        webSocketFactory: () => {
          console.log(`Creating SockJS connection to: ${this.wsUrl}`);
          return new SockJS(this.wsUrl);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (str) => console.log("STOMP: " + str),
        onConnect: (frame) => {
          console.log("STOMP Connected successfully:", frame);
          this.connected = true;
          resolve();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame.headers["message"]);
          console.error("Full STOMP error frame:", frame);
          reject(frame.headers["message"]);
        },
        onWebSocketError: (event) => {
          console.error("WebSocket error:", event);
          reject("WebSocket connection failed");
        },
        onDisconnect: (frame) => {
          console.log("STOMP Disconnected:", frame);
          this.connected = false;
        },
      });

      console.log("Activating STOMP client...");
      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  // Subscribe to a destination with callback
  subscribe(destination, callback) {
    if (!this.connected) {
      throw new Error("WebSocket not connected");
    }

    // Check if already subscribed to this destination
    if (this.subscriptions.has(destination)) {
      console.log(
        `Already subscribed to ${destination}, skipping duplicate subscription`
      );
      return this.subscriptions.get(destination);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        console.log(`Raw message received on ${destination}:`, message.body);
        const parsedMessage = JSON.parse(message.body);
        console.log(`Parsed message on ${destination}:`, parsedMessage);
        callback(parsedMessage);
      } catch (error) {
        console.error(
          `Error parsing message on ${destination}:`,
          error,
          message.body
        );
      }
    });

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  // Unsubscribe from a destination
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  // Send message to server
  send(destination, message) {
    if (!this.connected) {
      throw new Error("WebSocket not connected");
    }

    const messageBody = JSON.stringify(message);
    console.log(`Sending to ${destination}:`, messageBody);

    this.client.publish({
      destination,
      body: messageBody,
    });
  }
}

export default new WebSocketService();
