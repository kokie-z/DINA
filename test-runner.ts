import { runAllTests } from './src/services/gemini';

async function main() {
  try {
    const results = await runAllTests();
    console.log(JSON.stringify(results, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
