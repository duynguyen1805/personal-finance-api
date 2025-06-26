import { merge } from 'lodash';
import fetch, { RequestInfo, RequestInit } from 'node-fetch';

export class Fetch {
  private static async fetch(url: RequestInfo, init: RequestInit) {
    try {
      const response = await fetch(url, init);
      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error('CANNOT_FETCH');
    }
  }

  static async post<T>(url: RequestInfo, init: RequestInit = undefined) {
    return this.fetch(
      url,
      merge(
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
        init
      )
    );
  }

  static async get<T>(url: RequestInfo, init: RequestInit = undefined) {
    return this.fetch(url, init);
  }
}
