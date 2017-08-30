"use strict";

import io from 'socket.io-client';

export default class DataGetter {
  constructor() {
    this.socket = io();
    this.commands = {};

    this.setupSocket();
  }

  setupSocket() {
    this.socket.on('connect_failed', () => {
      this.socket.close();
    });
  }

  events() {
    let result = {};
    this.socket.emit('events', {}, (data) => {
      result = data;
    });
    console.log(result)
    return result;
  }
}
