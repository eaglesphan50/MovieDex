import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from './logger';

export class Connection {
  private static tmdbConnection: AxiosInstance;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3/';

  constructor(override = false) {
    if (!Connection.tmdbConnection || override) {
      Connection.tmdbConnection = axios.create({
        baseURL: this.TMDB_BASE_URL,
        timeout: 5000,
        headers: {
          Authorization: 'Bearer ' + process.env.TMDB_KEY
        }
      });
    }
  }

  public async get(url: string): Promise<AxiosResponse> {
    return await Connection.tmdbConnection.get(url);
  }
}