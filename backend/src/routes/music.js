import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getSpotifyAuthUrl,
  spotifyCallback,
  getSpotifyToken,
  spotifySearch,
  spotifyPlay,
  getYoutubeAuthUrl,
  youtubeCallback,
  youtubeSearch,
  youtubePlay,
} from '../controllers/musicController.js';

const router = Router();

router.get('/spotify/auth-url', auth, getSpotifyAuthUrl);
router.post('/spotify/callback', spotifyCallback);
router.get('/spotify/token', auth, getSpotifyToken);
router.get('/spotify/search', auth, spotifySearch);
router.post('/spotify/play', auth, spotifyPlay);

router.get('/youtube/auth-url', auth, getYoutubeAuthUrl);
router.post('/youtube/callback', youtubeCallback);
router.get('/youtube/search', auth, youtubeSearch);
router.post('/youtube/play', auth, youtubePlay);

export default router;
