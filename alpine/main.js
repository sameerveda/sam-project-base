import 'basscss/css/basscss.css';
import './style.scss';
import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.data('root', () => ({
  title: 'hello world',
}));

Alpine.start();
