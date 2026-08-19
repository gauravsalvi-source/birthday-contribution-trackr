import app, { registerErrorHandler } from '../server/app.js';

registerErrorHandler(app);

export default app;
