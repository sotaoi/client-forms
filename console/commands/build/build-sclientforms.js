#!/usr/bin/env node

const {
  buildSclientformsRoutine,
} = require('@sotaoi/client-forms/console/commands/routines/build-sclientforms-routine');

const main = async () => {
  //

  await buildSclientformsRoutine(false);

  //
};

main();
