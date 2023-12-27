import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from './logger';

export class TmdbConnection {
  private static tmdbConnection: AxiosInstance;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3/';

  constructor(override = false) {
    if (!TmdbConnection.tmdbConnection || override) {
      TmdbConnection.tmdbConnection = axios.create({
        baseURL: this.TMDB_BASE_URL,
        timeout: 5000,
        headers: {
          Authorization: 'Bearer ' + process.env.TMDB_KEY
        }
      });
    }
  }

  public async get(url: string): Promise<AxiosResponse> {
    return await TmdbConnection.tmdbConnection.get(url);
  }
}