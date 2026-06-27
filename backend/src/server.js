import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`Vora Addis HMS API listening on port ${env.port}`);
});

