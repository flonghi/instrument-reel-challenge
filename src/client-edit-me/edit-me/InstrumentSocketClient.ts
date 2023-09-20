/**
 * ☑️ You can edit MOST of this file to add your own styles.
 */

/**
 * ✅ You can add/edit these imports
 */
import { WebSocketServer } from 'ws';
import {
  Instrument,
  InstrumentSymbol,
  WebSocketClientMessageJson,
  WebSocketMessage,
  WebSocketReadyState,
  WebSocketServerMessageJson,
} from '../../common-leave-me';

/**
 * Notes:
 * 
 * To subscribe or unsubscribe to/from instrument(s), send a message to the server with the following format:
 * 
 * export type WebSocketClientMessageJson =
  | {
      type: "subscribe";
      instrumentSymbols: InstrumentSymbol[];
    }
  | {
      type: "unsubscribe";
      instrumentSymbols: InstrumentSymbol[];
    };
  *
  * The server will start responding with a message with the following format:
  * 
  * export type WebSocketServerMessageJson = {
      type: "update";
      instruments: Instrument[];
    };
 */

type MessageCallback = (data: Instrument[]) => void;

/**
 * ❌ Please do not edit this class name
 */
export class InstrumentSocketClient {
  /**
   * ❌ Please do not edit this private property name
   */
  private _socket: WebSocket;

  /**
   * ✅ You can add more properties for the class here (if you want) 👇
   */
  private _subscriptions: InstrumentSymbol[] = [];
  private isConnected: boolean = false;
  private _callbacks: Map<
    string,
    { callback: MessageCallback; instruments: InstrumentSymbol[] }
  > = new Map();

  constructor() {
    /**
     * ❌ Please do not edit this private property assignment
     */
    this._socket = new WebSocket('ws://localhost:3000/ws');

    /**
     * ✅ You can edit from here down 👇
     */

    this._socket.addEventListener('open', () => {
      console.log(`Connected to socket`);
      this.isConnected = true;
      this.sendSubscriptions();
    });

    this._socket.addEventListener('message', (event) => {
      const message: WebSocketServerMessageJson = JSON.parse(event.data);

      this._callbacks.forEach(({ instruments, callback }, id) => {
        const instrumentsFiltered = message.instruments.filter((instrument) =>
          instruments.includes(instrument.code)
        );
        callback(instrumentsFiltered);
      });
    });

    this._socket.addEventListener('error', (event) => {
      console.error('WebSocket Error:', event);
    });

    this._socket.addEventListener('close', () => {
      console.log(`Disconnected from socket`);
    });
  }

  public subscribe(
    instrumentSymbols: InstrumentSymbol[],
    callback: MessageCallback
  ) {
    const id = crypto.randomUUID();
    this._callbacks.set(id, { callback, instruments: instrumentSymbols });
    this.sendSubscriptions();

    return () => this.unsubscribe(id);
  }

  public unsubscribe(id: string) {
    if (this.isConnected) {
      try {
        const sub = this._callbacks.get(id);

        if (!sub) throw new Error(`Sub not found id=${id}`);

        let otherSubsInstruments: InstrumentSymbol[] = [];
        this._callbacks.forEach(({ instruments }, key) => {
          if (key !== id) {
            otherSubsInstruments = [
              ...new Set([...otherSubsInstruments, ...instruments]),
            ];
          }
        });
        const instrumentSymbols = sub.instruments.filter(
          (instrument) => !otherSubsInstruments.includes(instrument)
        );

        this._callbacks.delete(id);

        if (instrumentSymbols) {
          const unsubscribePayload: WebSocketClientMessageJson = {
            type: 'unsubscribe',
            instrumentSymbols,
          };
          this._socket.send(JSON.stringify(unsubscribePayload));
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  public close() {
    this._socket.close();
  }

  private sendSubscriptions() {
    if (this.isConnected) {
      let instrumentsToSubscribe: InstrumentSymbol[] = [];
      this._callbacks.forEach(({ instruments }) => {
        instrumentsToSubscribe = [
          ...new Set([...instrumentsToSubscribe, ...instruments]),
        ];
      });

      const subscriptionPayload: WebSocketClientMessageJson = {
        type: 'subscribe',
        instrumentSymbols: instrumentsToSubscribe,
      };

      this._socket.send(JSON.stringify(subscriptionPayload));
    }
  }
}
