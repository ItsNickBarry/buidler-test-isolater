const cp = require('child_process');
const { minify } = require('terser');

const {
  TASK_TEST,
  TASK_TEST_GET_TEST_FILES,
} = require('@nomiclabs/buidler/builtin-tasks/task-names');

const fs = require('fs');

task(TASK_TEST, async function (args, bre, runSuper) {
  let path = `${ bre.config.paths.tests }/.buidler_test_isolater_tmp.js`;

  if (process.argv.includes(path)) {
    return await runSuper();
  }

  if (!fs.existsSync(bre.config.paths.tests)) {
    fs.mkdirSync(bre.config.paths.tests, { recursive: true });
  }

  let files = await bre.run(TASK_TEST_GET_TEST_FILES, args);

  for (let file of files) {
    let source = fs.readFileSync(file).toString();

    let { code } = await minify(source);

    if (code.match(/\Wit\.only\(/)) {
      code = code.replace(/(\W)it\(/g, '$1it.skip(');
      code = code.replace(/(\W)it\.only\(/g, '$1it(');
    }

    let regexp = /(\W)it\(/g;

    while (regexp.exec(code)) {
      let i = regexp.lastIndex - 1;
      let output = `${ code.slice(0, i) }.only${ code.slice(i) }`;

      fs.writeFileSync(path, output, { flag: 'w' });

      let buidlerArguments = process.argv.filter(a => !a.endsWith('.js'));
      buidlerArguments.splice(3, 0, path, '--no-compile');

      buidlerArguments = buidlerArguments.reduce(function (acc, cur) {
        if (!acc.seen.has(cur)) {
          acc.seen.add(cur);
          acc.result.push(cur);
        }
        return acc;
      }, { seen: new Set(), result: [] }).result;

      cp.spawnSync(
        buidlerArguments.join(' '),
        { stdio: 'inherit', shell: true }
      );

      fs.unlinkSync(path);
    }
  }
});
