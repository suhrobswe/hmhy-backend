import { Application } from './api/app.service';

async function main() {
  const application = new Application();
  await application.start();
}

main();
