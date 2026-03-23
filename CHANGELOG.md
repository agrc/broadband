# Changelog

## [3.0.1](https://github.com/agrc/broadband/compare/v3.0.1...v3.0.1) (2026-03-23)


### ⚠ BREAKING CHANGES

* switch to experience builder

### Features

* add 20 stop to speed sliders ([14d3007](https://github.com/agrc/broadband/commit/14d3007c32a347e2c1a6ce705e11f92b949fdd78)), closes [#131](https://github.com/agrc/broadband/issues/131)
* add code to allow for running pallet as standalone script ([0b90223](https://github.com/agrc/broadband/commit/0b90223ee4ceae2ba04bacb3454ebbb3c9909209))
* add draft flag to iframe src URL everything but production builds ([607d921](https://github.com/agrc/broadband/commit/607d921d6c25d427000a13dcb324712c60d699f7))
* add test job to actions ([0b09286](https://github.com/agrc/broadband/commit/0b09286bb571ed36da4a6dff7e3569c7c18d6504))
* add UDS header & footer ([db582e8](https://github.com/agrc/broadband/commit/db582e82b88fd31ca8f87118012c6c46cfff5235))
* **build:** github fed and upgrade action ([e9c1a7e](https://github.com/agrc/broadband/commit/e9c1a7ec387ef40ed459f34d4fc9dab856eff0d4))
* re-wire up firebase app with analytics ([06a71fa](https://github.com/agrc/broadband/commit/06a71fad5839f45aa237c872602046082fae2dc0))
* use footer links from connecting.utah.gov ([fd9d061](https://github.com/agrc/broadband/commit/fd9d061cac7439cee47c195557dce7ca21f11b86))


### Bug Fixes

* :evergreen_tree: november package updates ([eb29de6](https://github.com/agrc/broadband/commit/eb29de6b04b13034f868db7fd845e3fafbe3bdfd))
* a11y improvements ([86e74af](https://github.com/agrc/broadband/commit/86e74af07105ef9e4678d2269cb6e3cc87904ce5))
* accessibility improvements ([b5adb2f](https://github.com/agrc/broadband/commit/b5adb2f3d91b9a835f4dfb4150a1876a38cce686))
* add config to build call for standalone run ([2ba15ec](https://github.com/agrc/broadband/commit/2ba15ec917554237171f786a42d71fc63ede3e39))
* add missing local fonts ([5b838d3](https://github.com/agrc/broadband/commit/5b838d3ceb01c6eaad592981e3e997a8f951fb9f))
* add more specific permissions to deploy ([f401f0b](https://github.com/agrc/broadband/commit/f401f0ba5e7cae560863a48b7a71ed4141d4e4c8))
* add serverless dns to esri config for cors enabled servers ([c291977](https://github.com/agrc/broadband/commit/c291977ba4500e09482265d3f3f551d74f6660e7))
* apply more specific permissions ([e609e51](https://github.com/agrc/broadband/commit/e609e51ce028349dae82b5e338e3281f7ccdf799))
* build optimizations and exclude problem file ([f9503f1](https://github.com/agrc/broadband/commit/f9503f13307c8068b799fbf85b7bb6ac6b1e1384))
* **build:** ignore problem bower dep ([06488de](https://github.com/agrc/broadband/commit/06488dedb2558e5407ee762712703e26582bf8a2))
* **build:** ignore unavailable package ([0a82407](https://github.com/agrc/broadband/commit/0a824078834107f6e06549f9e455393eb55cf48d))
* **build:** put ignore in the correct place ([c615c56](https://github.com/agrc/broadband/commit/c615c564816844a7a431279bd0778ed982bbfac2))
* bump bower deps 🌲 ([786d1f4](https://github.com/agrc/broadband/commit/786d1f4d55cef17be83dccf2f42d416de5111734))
* bump deps ([27e2eb6](https://github.com/agrc/broadband/commit/27e2eb604db17242161ab4e6ba956eb31f392441))
* dojo build ([930b722](https://github.com/agrc/broadband/commit/930b722ca8d484ded90dd4a256f6e20b02dbb095))
* don't commit bumps ([b9312c3](https://github.com/agrc/broadband/commit/b9312c3827e5f7f44d8dd22ef37a3ed401911881))
* fix bower resolutions ([4958c1a](https://github.com/agrc/broadband/commit/4958c1a0d64de35d94200c95a25a3dd5242dcd8e))
* fix build ([a4229de](https://github.com/agrc/broadband/commit/a4229dee2cf642a9aab49d58bda816195cb7dd1a))
* fix CORS requests to feedback service ([6709dde](https://github.com/agrc/broadband/commit/6709dde117f82e81a4a9ba771da675105b7b9a8a))
* fix geocoding request in Chrome ([c756f51](https://github.com/agrc/broadband/commit/c756f51bbf4c40adf0cf8f0299238188d65c05fd))
* fix import typo ([d29ea26](https://github.com/agrc/broadband/commit/d29ea26c48dc65bfcc0f959954654574439725c1))
* fix path to map services for recaching ([e531354](https://github.com/agrc/broadband/commit/e531354fe3cd7155dc295989011910df0e7b2fa2))
* fix prod deploy if condition ([9832603](https://github.com/agrc/broadband/commit/983260350cfaba05f45233e93618e1ce597260ac))
* fix x-frame-options ([0a4d961](https://github.com/agrc/broadband/commit/0a4d961b8b77762fa13ddf9e4bef2e8038bcd0f2))
* Migrate to new SITLA Vector Tile service ([32dc122](https://github.com/agrc/broadband/commit/32dc1225c3ceb18941247b641b7c995f5aa34147))
* more responsive header title text size ([ee84ad6](https://github.com/agrc/broadband/commit/ee84ad67ed10750c1f1cefdd0c56124f55087172))
* pin ijit version ([33d046e](https://github.com/agrc/broadband/commit/33d046effe2b08e9d370199e5f0b12e527d5ca0d))
* point at new *.ugrc.utah.gov quad word for prod ([b8f7ea2](https://github.com/agrc/broadband/commit/b8f7ea2cf21d32928a7a91bd927c5512474a450e))
* point to ijit master ([a3199d3](https://github.com/agrc/broadband/commit/a3199d32f7322facc64ea67ddbcea956653738a7))
* Q2 Dep Bumps 🌲 ([c55b817](https://github.com/agrc/broadband/commit/c55b817f58e06e000f279796b93b529e4e98ce7f))
* remove iframe border ([78ac445](https://github.com/agrc/broadband/commit/78ac445546d044d12058735e80b18552aad97898))
* remove jasmine version pin ([3c1c868](https://github.com/agrc/broadband/commit/3c1c86872b4f2e939d7c7b2eaff20d22ef0fc05f))
* remove/update all links to broadband.utah.gov ([b953669](https://github.com/agrc/broadband/commit/b9536699accda2b1c0dcc7eb2ac62c1a33e7de46)), closes [#115](https://github.com/agrc/broadband/issues/115)
* SGID10 -&gt; SGID ([85f8c18](https://github.com/agrc/broadband/commit/85f8c1839531ca5715196ed2f82db49f071c3623))
* switch caching to pro ([68b7f59](https://github.com/agrc/broadband/commit/68b7f59fdd8d117151431769e9d2dd760864460c))
* switch caching to pro ([ddd9685](https://github.com/agrc/broadband/commit/ddd9685708359c22b29ff49cc8574c3d45b9a1e6))
* switch caching to pro ([#90](https://github.com/agrc/broadband/issues/90)) ([68b7f59](https://github.com/agrc/broadband/commit/68b7f59fdd8d117151431769e9d2dd760864460c))
* switch to experience builder embedded in iframe ([1974e39](https://github.com/agrc/broadband/commit/1974e39d7669cfaae5b205636cc9b8fed82e68aa))
* switch to new api for sending custom google analytics events ([29ad2ca](https://github.com/agrc/broadband/commit/29ad2ca5cadb2cc294ecf4c078cecf3b74421811))
* switch to using serverless-print-proxy for print service ([a03a879](https://github.com/agrc/broadband/commit/a03a8795d6655550573d20ee52385c1588690ff9)), closes [#45](https://github.com/agrc/broadband/issues/45)
* update broadband logo ([f74fb47](https://github.com/agrc/broadband/commit/f74fb47fbcb8690f18cda8730c59c202cbeb7101)), closes [#92](https://github.com/agrc/broadband/issues/92)
* update esri api to allow for bower install and build ([275d8a3](https://github.com/agrc/broadband/commit/275d8a3bb81680d21d1eecbf9996bf71349eac4f))
* update path to py2 for 10.7 ([3d2a9d7](https://github.com/agrc/broadband/commit/3d2a9d72b02cef87b02c4514e051ee18de9bba3e))
* update python paths for 10.6 ([277d844](https://github.com/agrc/broadband/commit/277d844710874e0355f5f6778bc3fe672bc1a39f))
* update python paths for 10.6 ([328d6b7](https://github.com/agrc/broadband/commit/328d6b75cf6b8650b9da8df4e85525216f76ddf7))
* update to v2 of print proxy ([fbea328](https://github.com/agrc/broadband/commit/fbea328290a0ee14566baf32e392e6b7d006f962))
* upgrade esri js to fix map click bug in chrome ([d437b64](https://github.com/agrc/broadband/commit/d437b643790a2a3beabdfb6fad0dc7665ce37c3d))
* upgrade ijit library to fix [#83](https://github.com/agrc/broadband/issues/83) ([e4b9450](https://github.com/agrc/broadband/commit/e4b9450c85d9f39593a1a08b9ddea4e4cbb68d40))
* upgrade to node lts ([c8e1e39](https://github.com/agrc/broadband/commit/c8e1e39221cc0487dddc0067caf13ca410cf26ab))
* upgrade to standardized actions ([5670461](https://github.com/agrc/broadband/commit/5670461d1caa1d446bced04b5efe8479125de40e))
* use new GA4 analytics id and snippet ([478973a](https://github.com/agrc/broadband/commit/478973ab261b9d3133f4c5aa30d8d8a532ff5712))
* use shortened url ([2c1dc19](https://github.com/agrc/broadband/commit/2c1dc19e60a64eb5fd9f7ccd9ad08207fb1cce89))


### Dependencies

* audit fix ([b73b058](https://github.com/agrc/broadband/commit/b73b058b0b26ed5741da8a7712ae0e850566b7aa))
* bump npm dependencies 🌲 ([c5c05d6](https://github.com/agrc/broadband/commit/c5c05d6527cb1ff8d0b0774b6a9f0cdd8d5c9d2b))
* bump the npm_and_yarn group with 2 updates ([a360cb9](https://github.com/agrc/broadband/commit/a360cb906b3d12bd5a86b5931dbd8331dc6c01f7))
* **dev:** bump eslint-plugin-html in the safe-dependencies group ([bb3b646](https://github.com/agrc/broadband/commit/bb3b646b96036ed726aa328efdd13191cf8ac5ce))
* **dev:** bump globals in the major-dependencies group ([b221b73](https://github.com/agrc/broadband/commit/b221b73af8a2ca23988a8788fc96ce0199a8dfd3))
* **dev:** bump globals in the safe-dependencies group ([faf9223](https://github.com/agrc/broadband/commit/faf9223d86cf954ece022b5d180e49aa5a5c635c))
* **dev:** bump the safe-dependencies group across 1 directory with 2 updates ([2e1a9b1](https://github.com/agrc/broadband/commit/2e1a9b1dec3150a835f86b22e0d812ba534cc21b))
* **dev:** bump the safe-dependencies group across 1 directory with 4 updates ([c938157](https://github.com/agrc/broadband/commit/c938157b64c3577d49f22baa8ac12713325681ed))
* **dev:** bump the safe-dependencies group with 2 updates ([6aed455](https://github.com/agrc/broadband/commit/6aed455c0368c4df5a49aa2f0ad48f1940383cf8))
* FY25Q2 dependency updates 🌲 ([36404b5](https://github.com/agrc/broadband/commit/36404b51b76c4b0e4493020a88d7aae70eada31f))
* q4 ci dependency updates ([b41bae2](https://github.com/agrc/broadband/commit/b41bae2918686f37b114b1af1054cb61a249f6cb))
* q4 npm dependency updates ([d2a0811](https://github.com/agrc/broadband/commit/d2a081130c192def7222c8c906257cd7d9321aa2))


### Documentation

* correct badge url ([951ab6d](https://github.com/agrc/broadband/commit/951ab6d7500db7b31f121d6d336f13e05ec9a2ce))
* deploy command and contact ([f76b3e0](https://github.com/agrc/broadband/commit/f76b3e09919a47c26b3fbba240aaf4cf293621a4))
* update readme ([ff4fbd9](https://github.com/agrc/broadband/commit/ff4fbd95c48d18b24f1ffe032982ce3455d0e4e6))

## [3.0.1](https://github.com/agrc/broadband/compare/v3.0.0...v3.0.1) (2025-12-01)


### Bug Fixes

* add missing local fonts ([5b838d3](https://github.com/agrc/broadband/commit/5b838d3ceb01c6eaad592981e3e997a8f951fb9f))

## [3.0.0](https://github.com/agrc/broadband/compare/v2.13.9...v3.0.0) (2025-11-18)


### ⚠ BREAKING CHANGES

* switch to experience builder

### Features

* add draft flag to iframe src URL everything but production builds ([607d921](https://github.com/agrc/broadband/commit/607d921d6c25d427000a13dcb324712c60d699f7))
* add UDS header & footer ([db582e8](https://github.com/agrc/broadband/commit/db582e82b88fd31ca8f87118012c6c46cfff5235))
* re-wire up firebase app with analytics ([06a71fa](https://github.com/agrc/broadband/commit/06a71fad5839f45aa237c872602046082fae2dc0))
* use footer links from connecting.utah.gov ([fd9d061](https://github.com/agrc/broadband/commit/fd9d061cac7439cee47c195557dce7ca21f11b86))


### Bug Fixes

* fix x-frame-options ([0a4d961](https://github.com/agrc/broadband/commit/0a4d961b8b77762fa13ddf9e4bef2e8038bcd0f2))
* more responsive header title text size ([ee84ad6](https://github.com/agrc/broadband/commit/ee84ad67ed10750c1f1cefdd0c56124f55087172))
* remove iframe border ([78ac445](https://github.com/agrc/broadband/commit/78ac445546d044d12058735e80b18552aad97898))
* switch to experience builder embedded in iframe ([1974e39](https://github.com/agrc/broadband/commit/1974e39d7669cfaae5b205636cc9b8fed82e68aa))
* use shortened url ([2c1dc19](https://github.com/agrc/broadband/commit/2c1dc19e60a64eb5fd9f7ccd9ad08207fb1cce89))

## [3.0.0-rc.2](https://github.com/agrc/broadband/compare/v2.13.8...v3.0.0-rc.2) (2025-10-10)


### ⚠ BREAKING CHANGES

* switch to experience builder

### Bug Fixes

* switch to experience builder embedded in iframe ([7bc58b4](https://github.com/agrc/broadband/commit/7bc58b4fa321afae2412c782e379a14350645954))

## [3.0.0-rc.1](https://github.com/agrc/broadband/compare/v2.13.8...v3.0.0-rc.1) (2025-10-10)


### ⚠ BREAKING CHANGES

* switch to experience builder

### Bug Fixes

* switch to experience builder embedded in iframe ([53c86c9](https://github.com/agrc/broadband/commit/53c86c95574823e9c15fa7ac2060acbb8909b509))

## [2.13.9](https://github.com/agrc/broadband/compare/v2.13.8...v2.13.9) (2025-11-11)


### Dependencies

* **dev:** bump globals in the safe-dependencies group ([faf9223](https://github.com/agrc/broadband/commit/faf9223d86cf954ece022b5d180e49aa5a5c635c))

## [2.13.8](https://github.com/agrc/broadband/compare/v2.13.7...v2.13.8) (2025-07-30)


### Dependencies

* audit fix ([b73b058](https://github.com/agrc/broadband/commit/b73b058b0b26ed5741da8a7712ae0e850566b7aa))
* bump the npm_and_yarn group with 2 updates ([a360cb9](https://github.com/agrc/broadband/commit/a360cb906b3d12bd5a86b5931dbd8331dc6c01f7))
* **dev:** bump the safe-dependencies group with 2 updates ([6aed455](https://github.com/agrc/broadband/commit/6aed455c0368c4df5a49aa2f0ad48f1940383cf8))

## [2.13.7](https://github.com/agrc/broadband/compare/v2.13.6...v2.13.7) (2025-05-21)


### Dependencies

* **dev:** bump globals in the major-dependencies group ([b221b73](https://github.com/agrc/broadband/commit/b221b73af8a2ca23988a8788fc96ce0199a8dfd3))

## [2.13.6](https://github.com/agrc/broadband/compare/v2.13.5...v2.13.6) (2025-01-07)


### Dependencies

* **dev:** bump the safe-dependencies group across 1 directory with 2 updates ([2e1a9b1](https://github.com/agrc/broadband/commit/2e1a9b1dec3150a835f86b22e0d812ba534cc21b))

## [2.13.5](https://github.com/agrc/broadband/compare/v2.13.5-1...v2.13.5) (2024-10-04)


### Bug Fixes

* fix build ([a4229de](https://github.com/agrc/broadband/commit/a4229dee2cf642a9aab49d58bda816195cb7dd1a))

## [2.13.5-1](https://github.com/agrc/broadband/compare/v2.13.5-0...v2.13.5-1) (2024-10-04)


### Bug Fixes

* fix prod deploy if condition ([9832603](https://github.com/agrc/broadband/commit/983260350cfaba05f45233e93618e1ce597260ac))

## [2.13.5-0](https://github.com/agrc/broadband/compare/v2.13.4...v2.13.5-0) (2024-10-04)


### Dependencies

* FY25Q2 dependency updates 🌲 ([36404b5](https://github.com/agrc/broadband/commit/36404b51b76c4b0e4493020a88d7aae70eada31f))

## [2.13.4](https://github.com/agrc/broadband/compare/v2.13.3...v2.13.4) (2024-07-16)


### Bug Fixes

* update to v2 of print proxy ([fbea328](https://github.com/agrc/broadband/commit/fbea328290a0ee14566baf32e392e6b7d006f962))


### Dependencies

* **dev:** bump eslint-plugin-html in the safe-dependencies group ([bb3b646](https://github.com/agrc/broadband/commit/bb3b646b96036ed726aa328efdd13191cf8ac5ce))

## [2.13.3](https://github.com/agrc/broadband/compare/v2.13.2...v2.13.3) (2024-04-16)


### 🐛 Bug Fixes

* Migrate to new SITLA Vector Tile service ([32dc122](https://github.com/agrc/broadband/commit/32dc1225c3ceb18941247b641b7c995f5aa34147))

## [2.13.2](https://github.com/agrc/broadband/compare/v2.13.1...v2.13.2) (2023-10-12)


### 🐛 Bug Fixes

* switch to new api for sending custom google analytics events ([29ad2ca](https://github.com/agrc/broadband/commit/29ad2ca5cadb2cc294ecf4c078cecf3b74421811))


### 📖 Documentation Improvements

* correct badge url ([951ab6d](https://github.com/agrc/broadband/commit/951ab6d7500db7b31f121d6d336f13e05ec9a2ce))

## [2.13.1](https://github.com/agrc/broadband/compare/v2.13.0...v2.13.1) (2023-10-10)


### 🐛 Bug Fixes

* use new GA4 analytics id and snippet ([478973a](https://github.com/agrc/broadband/commit/478973ab261b9d3133f4c5aa30d8d8a532ff5712))


### 🌲 Dependencies

* q4 ci dependency updates ([b41bae2](https://github.com/agrc/broadband/commit/b41bae2918686f37b114b1af1054cb61a249f6cb))
* q4 npm dependency updates ([d2a0811](https://github.com/agrc/broadband/commit/d2a081130c192def7222c8c906257cd7d9321aa2))

## [2.13.0](https://github.com/agrc/broadband/compare/v2.12.0...v2.13.0) (2023-07-06)


### 🚀 Features

* **build:** github fed and upgrade action ([e9c1a7e](https://github.com/agrc/broadband/commit/e9c1a7ec387ef40ed459f34d4fc9dab856eff0d4))


### 🐛 Bug Fixes

* :evergreen_tree: november package updates ([eb29de6](https://github.com/agrc/broadband/commit/eb29de6b04b13034f868db7fd845e3fafbe3bdfd))
* add more specific permissions to deploy ([f401f0b](https://github.com/agrc/broadband/commit/f401f0ba5e7cae560863a48b7a71ed4141d4e4c8))
* apply more specific permissions ([e609e51](https://github.com/agrc/broadband/commit/e609e51ce028349dae82b5e338e3281f7ccdf799))
* **build:** ignore problem bower dep ([06488de](https://github.com/agrc/broadband/commit/06488dedb2558e5407ee762712703e26582bf8a2))
* **build:** ignore unavailable package ([0a82407](https://github.com/agrc/broadband/commit/0a824078834107f6e06549f9e455393eb55cf48d))
* **build:** put ignore in the correct place ([c615c56](https://github.com/agrc/broadband/commit/c615c564816844a7a431279bd0778ed982bbfac2))
* bump bower deps 🌲 ([786d1f4](https://github.com/agrc/broadband/commit/786d1f4d55cef17be83dccf2f42d416de5111734))
* bump deps ([27e2eb6](https://github.com/agrc/broadband/commit/27e2eb604db17242161ab4e6ba956eb31f392441))
* dojo build ([930b722](https://github.com/agrc/broadband/commit/930b722ca8d484ded90dd4a256f6e20b02dbb095))
* don't commit bumps ([b9312c3](https://github.com/agrc/broadband/commit/b9312c3827e5f7f44d8dd22ef37a3ed401911881))
* Q2 Dep Bumps 🌲 ([c55b817](https://github.com/agrc/broadband/commit/c55b817f58e06e000f279796b93b529e4e98ce7f))
* remove jasmine version pin ([3c1c868](https://github.com/agrc/broadband/commit/3c1c86872b4f2e939d7c7b2eaff20d22ef0fc05f))
* upgrade to node lts ([c8e1e39](https://github.com/agrc/broadband/commit/c8e1e39221cc0487dddc0067caf13ca410cf26ab))
* upgrade to standardized actions ([5670461](https://github.com/agrc/broadband/commit/5670461d1caa1d446bced04b5efe8479125de40e))

## [2.13.0-2](https://github.com/agrc/broadband/compare/v2.13.0-1...v2.13.0-2) (2023-07-05)


### 🐛 Bug Fixes

* add more specific permissions to deploy ([e78e0d2](https://github.com/agrc/broadband/commit/e78e0d23948392aa9b2b8de70f2b4e061907ce8e))

## [2.13.0-1](https://github.com/agrc/broadband/compare/v2.13.0-0...v2.13.0-1) (2023-07-05)


### 🐛 Bug Fixes

* don't commit bumps ([94e10fc](https://github.com/agrc/broadband/commit/94e10fc477b1dc2a0f8f259c9cc16b6ca86b41c3))

## [2.13.0-0](https://github.com/agrc/broadband/compare/v2.12.0...v2.13.0-0) (2023-07-05)


### 🚀 Features

* **build:** github fed and upgrade action ([e9c1a7e](https://github.com/agrc/broadband/commit/e9c1a7ec387ef40ed459f34d4fc9dab856eff0d4))


### 🐛 Bug Fixes

* :evergreen_tree: november package updates ([eb29de6](https://github.com/agrc/broadband/commit/eb29de6b04b13034f868db7fd845e3fafbe3bdfd))
* apply more specific permissions ([e609e51](https://github.com/agrc/broadband/commit/e609e51ce028349dae82b5e338e3281f7ccdf799))
* **build:** ignore problem bower dep ([06488de](https://github.com/agrc/broadband/commit/06488dedb2558e5407ee762712703e26582bf8a2))
* **build:** ignore unavailable package ([0a82407](https://github.com/agrc/broadband/commit/0a824078834107f6e06549f9e455393eb55cf48d))
* **build:** put ignore in the correct place ([c615c56](https://github.com/agrc/broadband/commit/c615c564816844a7a431279bd0778ed982bbfac2))
* bump bower deps 🌲 ([786d1f4](https://github.com/agrc/broadband/commit/786d1f4d55cef17be83dccf2f42d416de5111734))
* bump deps ([27e2eb6](https://github.com/agrc/broadband/commit/27e2eb604db17242161ab4e6ba956eb31f392441))
* dojo build ([930b722](https://github.com/agrc/broadband/commit/930b722ca8d484ded90dd4a256f6e20b02dbb095))
* Q2 Dep Bumps 🌲 ([c55b817](https://github.com/agrc/broadband/commit/c55b817f58e06e000f279796b93b529e4e98ce7f))
* remove jasmine version pin ([3c1c868](https://github.com/agrc/broadband/commit/3c1c86872b4f2e939d7c7b2eaff20d22ef0fc05f))
* upgrade to node lts ([c8e1e39](https://github.com/agrc/broadband/commit/c8e1e39221cc0487dddc0067caf13ca410cf26ab))
* upgrade to standardized actions ([5670461](https://github.com/agrc/broadband/commit/5670461d1caa1d446bced04b5efe8479125de40e))
