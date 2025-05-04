import { navigate } from './router.js';

document.getElementById('homeBtn').onclick = () => navigate('home');
document.getElementById('configBtn').onclick = () => navigate('config');
document.getElementById('moveBtn').onclick = () => navigate('free'); // stub
document.getElementById('goalBtn').onclick = () => navigate('goal'); // stub

navigate(location.hash.slice(1) || 'home');
