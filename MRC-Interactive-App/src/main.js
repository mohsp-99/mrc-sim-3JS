import { navigate } from './router.js';

navigate(location.hash.slice(1) || 'home');
