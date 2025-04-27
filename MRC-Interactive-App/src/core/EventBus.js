// Tiny pub/sub powered by mitt (200 B, zero-deps)
import mitt from 'mitt';

const bus = mitt();
export default bus;           // named default for brevity
