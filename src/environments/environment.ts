/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyBIm6l2rY3IygGKjDT8N0FPi10-MmH5pRs",
    authDomain: "alicorp-59656.firebaseapp.com",
    databaseURL: "https://alicorp-59656.firebaseio.com",
    projectId: "alicorp-59656",
    storageBucket: "alicorp-59656.appspot.com",
    messagingSenderId: "475514922269",
    appId: "1:475514922269:web:8f92debd3fc79f9c446df4",
    measurementId: "G-SSFG0WV824"
  },
  algolia: {
    appId: 'MT4EXTXTU4',
    apiKey: '6905c5f679ca93ef54e5f5f8c418d073',
    indexName: 'Productos',
    urlSync: false
  }
};
